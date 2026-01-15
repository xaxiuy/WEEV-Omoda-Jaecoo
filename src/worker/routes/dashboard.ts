import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

export const dashboardRoutes = new Hono<AuthEnv>();

dashboardRoutes.use('*', authMiddleware);

// Get user dashboard data
dashboardRoutes.get('/', async (c) => {
  const userId = c.get('userId') as string;

  // Get user stats
  const [activationsResult, eventsResult, walletCard, recentActivity, upcomingEvents] = await Promise.all([
    // Count activations
    c.env.DB.prepare('SELECT COUNT(*) as count FROM activations WHERE user_id = ? AND status = ?')
      .bind(userId, 'verified')
      .first(),
    
    // Count events attended
    c.env.DB.prepare('SELECT COUNT(*) as count FROM event_rsvps WHERE user_id = ? AND status = ?')
      .bind(userId, 'going')
      .first(),
    
    // Get wallet card
    c.env.DB.prepare('SELECT * FROM wallet_cards WHERE user_id = ?')
      .bind(userId)
      .first(),
    
    // Get recent activity (last 10 items)
    c.env.DB.prepare(
      `SELECT 
        'activation' as type,
        'Vehículo Activado' as title,
        'Has activado un ' || COALESCE(model, 'vehículo') as description,
        created_at as createdAt,
        id
      FROM activations 
      WHERE user_id = ? AND status = 'verified'
      UNION ALL
      SELECT 
        'event' as type,
        'Evento Confirmado' as title,
        'Te registraste en un evento' as description,
        created_at as createdAt,
        id
      FROM event_rsvps 
      WHERE user_id = ? AND status = 'going'
      UNION ALL
      SELECT 
        'card_upgrade' as type,
        title,
        description,
        created_at as createdAt,
        id
      FROM wallet_updates 
      WHERE user_id = ? AND type = 'card_upgrade'
      ORDER BY createdAt DESC 
      LIMIT 10`
    )
      .bind(userId, userId, userId)
      .all(),
    
    // Get upcoming events user is attending
    c.env.DB.prepare(
      `SELECT e.* 
       FROM events e
       JOIN event_rsvps r ON e.id = r.event_id
       WHERE r.user_id = ? 
       AND r.status = 'going'
       AND e.start_at > datetime('now')
       ORDER BY e.start_at ASC
       LIMIT 5`
    )
      .bind(userId)
      .all(),
  ]);

  // Get brand ID from wallet card
  const brandId = (walletCard as any)?.brand_id;

  // Get card progress if user has a brand card
  let cardProgress = null;
  if (brandId) {
    const [templates, activations, eventRSVPs] = await Promise.all([
      c.env.DB.prepare('SELECT * FROM card_templates WHERE brand_id = ? AND is_active = 1 ORDER BY tier')
        .bind(brandId)
        .all(),
      
      c.env.DB.prepare('SELECT * FROM activations WHERE user_id = ? AND status = ?')
        .bind(userId, 'verified')
        .all(),
      
      c.env.DB.prepare('SELECT e.type FROM event_rsvps r JOIN events e ON r.event_id = e.id WHERE r.user_id = ? AND r.status = ?')
        .bind(userId, 'going')
        .all(),
    ]);

    const activationsCount = (activations.results || []).length;
    const eventsCount = (eventRSVPs.results || []).length;

    // Calculate progress for each template
    const templatesWithProgress = (templates.results || []).map((template: any) => {
      const conditions = template.unlock_conditions ? JSON.parse(template.unlock_conditions).conditions || [] : [];
      
      const conditionProgress = conditions.map((condition: any) => {
        let current = 0;
        let required = 1;
        let met = false;

        switch (condition.type) {
          case 'activation':
            current = activationsCount;
            required = condition.params?.minQuantity || 1;
            met = current >= required;
            break;
          
          case 'event':
            current = eventsCount;
            required = condition.params?.minEvents || 1;
            met = current >= required;
            break;
          
          default:
            current = 0;
            required = condition.params?.minQuantity || condition.params?.minAmount || 1;
            met = false;
            break;
        }

        return { ...condition, current, required, met };
      });

      let unlocked = false;
      if (conditionProgress.length > 0) {
        unlocked = conditionProgress[0].met;
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
        id: template.id,
        name: template.name,
        tier: template.tier,
        progress: conditionProgress,
        unlocked: unlocked || template.tier === (walletCard as any)?.tier,
      };
    });

    cardProgress = {
      currentCard: walletCard,
      nextCards: templatesWithProgress.filter((t: any) => !t.unlocked),
    };
  }

  return c.json({
    userStats: {
      activations: (activationsResult as any)?.count || 0,
      eventsAttended: (eventsResult as any)?.count || 0,
      currentTier: (walletCard as any)?.tier || 'member',
      memberSince: (walletCard as any)?.created_at || new Date().toISOString(),
    },
    cardProgress,
    recentActivity: recentActivity.results || [],
    upcomingEvents: upcomingEvents.results?.map((e: any) => ({
      id: e.id,
      title: e.title,
      startAt: e.start_at,
      city: e.city,
      imageUrl: e.image_url,
    })) || [],
  });
});
