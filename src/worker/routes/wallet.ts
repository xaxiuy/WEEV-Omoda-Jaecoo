import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { Database } from '../lib/db';
import { generateId } from '../lib/crypto';
import { createNotification } from './notifications';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

export const walletRoutes = new Hono<AuthEnv>();

walletRoutes.use('*', authMiddleware);

// Get wallet card
walletRoutes.get('/card', async (c) => {
  const userId = c.get('userId') as string;
  const db = new Database(c.env.DB);

  const card = await db.getWalletCardByUserId(userId);

  if (!card) {
    return c.json({ card: null });
  }

  // Get brand info
  const brand = await db.getBrandById(card.brand_id);

  // Analytics
  await db.createAnalyticsEvent({
    id: generateId(),
    user_id: userId,
    brand_id: card.brand_id,
    event_type: 'wallet_view',
  });

  return c.json({
    card: {
      ...card,
      brand,
    },
  });
});

// Get wallet updates
walletRoutes.get('/updates', async (c) => {
  const userId = c.get('userId') as string;
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  
  const db = new Database(c.env.DB);

  const updates = await db.getWalletUpdates(userId, limit, offset);

  return c.json({ updates, hasMore: updates.length === limit });
});

// Mark update as read
walletRoutes.patch('/updates/:id/read', async (c) => {
  const userId = c.get('userId') as string;
  const updateId = c.req.param('id');
  const db = new Database(c.env.DB);

  await db.markWalletUpdateAsRead(updateId, userId);

  return c.json({ message: 'Update marked as read' });
});

// Get available card templates and user progress
walletRoutes.get('/templates', async (c) => {
  const userId = c.get('userId') as string;
  const db = new Database(c.env.DB);

  // Get user's current card
  const userCard = await db.getWalletCardByUserId(userId);
  
  if (!userCard) {
    return c.json({ templates: [], userProgress: null });
  }

  // Get all templates for the brand
  const templates = await db.getCardTemplates(userCard.brand_id);

  // Get user's activity data for progress calculation
  const [activations, eventRSVPs] = await Promise.all([
    db.getUserActivations(userId),
    db.getUserRSVPs(userId),
  ]);

  // Calculate progress for each template
  const templatesWithProgress = templates.map((template: any) => {
    const conditions = template.unlock_conditions?.conditions || [];
    const autoAssign = template.unlock_conditions?.autoAssign !== false;
    
    if (!autoAssign || conditions.length === 0) {
      return {
        ...template,
        progress: null,
        unlocked: template.tier === userCard.tier,
      };
    }

    // Calculate progress for each condition
    const conditionProgress = conditions.map((condition: any) => {
      let current = 0;
      let required = 1;
      let met = false;

      switch (condition.type) {
        case 'activation':
          current = activations.filter((a: any) => a.status === 'verified').length;
          required = condition.params?.minQuantity || 1;
          met = current >= required;
          break;
        
        case 'purchase':
          // Would need purchase tracking in the database
          current = 0;
          required = condition.params?.minQuantity || 1;
          met = false;
          break;
        
        case 'event':
          const relevantEvents = eventRSVPs.filter((rsvp: any) => 
            rsvp.status === 'going' && 
            (!condition.params?.eventType || rsvp.type === condition.params.eventType)
          );
          current = relevantEvents.length;
          required = condition.params?.minEvents || 1;
          met = current >= required;
          break;
        
        case 'spending':
          // Would need purchase amounts from a purchases table
          current = 0;
          required = condition.params?.minAmount || 0;
          met = false;
          break;
        
        case 'manual':
          met = false;
          break;
      }

      return { ...condition, current, required, met };
    });

    // Check if all conditions are met based on operators
    let unlocked = false;
    if (conditionProgress.length > 0) {
      const firstCondition = conditionProgress[0];
      unlocked = firstCondition.met;

      for (let i = 1; i < conditionProgress.length; i++) {
        const condition = conditionProgress[i];
        if (condition.operator === 'AND') {
          unlocked = unlocked && condition.met;
        } else {
          unlocked = unlocked || condition.met;
        }
      }
    }

    return {
      ...template,
      progress: conditionProgress,
      unlocked: unlocked || template.tier === userCard.tier,
    };
  });

  // Check if user has unlocked any new cards and notify them
  const unlockedCards = templatesWithProgress.filter(
    (t: any) => t.unlocked && t.tier !== userCard.tier
  );

  for (const card of unlockedCards) {
    // Check if we've already notified about this card
    const existingNotification = await c.env.DB.prepare(
      'SELECT id FROM notifications WHERE user_id = ? AND type = ? AND title LIKE ?'
    )
      .bind(userId, 'card_unlock', `%${card.name}%`)
      .first();

    if (!existingNotification) {
      // Create notification for newly unlocked card
      await createNotification(c.env.DB, {
        userId,
        brandId: userCard.brand_id,
        type: 'card_unlock',
        title: '¡Nueva Tarjeta Desbloqueada!',
        message: `Has desbloqueado la tarjeta ${card.name}. ¡Felicidades!`,
        actionUrl: '/wallet',
      });
    }
  }

  return c.json({
    templates: templatesWithProgress,
    userProgress: {
      activations: activations.filter((a: any) => a.status === 'verified').length,
      events: eventRSVPs.filter((r: any) => r.status === 'going').length,
      purchases: 0,
    },
  });
});
