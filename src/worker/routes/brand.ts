import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { Database } from '../lib/db';
import { generateId } from '../lib/crypto';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

const createPostSchema = z.object({
  type: z.enum(['post', 'announcement', 'update']),
  title: z.string().optional(),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  isPinned: z.boolean().optional(),
});

const createEventSchema = z.object({
  type: z.enum(['event', 'service_clinic', 'test_drive', 'meetup', 'launch', 'challenge']),
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  city: z.string().optional(),
  locationText: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  capacity: z.number().optional(),
});

const createProductSchema = z.object({
  category: z.string(),
  name: z.string().min(1),
  model: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  galleryUrls: z.array(z.string().url()).optional(),
  status: z.string().optional(),
  stockQuantity: z.number().optional(),
  year: z.number().optional(),
});

const createCardTemplateSchema = z.object({
  name: z.string().min(1),
  tier: z.string(),
  designConfig: z.record(z.any()).optional(),
  logoUrl: z.string().url().optional(),
  backgroundGradient: z.string().optional(),
  textColor: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  unlockConditions: z.record(z.any()).optional(),
});

export const brandRoutes = new Hono<AuthEnv>();

brandRoutes.use('*', authMiddleware);

// Middleware to get user's brand
async function getUserBrand(c: any, next: any) {
  const userId = c.get('userId') as string;
  const userRole = c.get('role') as string;
  const db = new Database(c.env.DB);

  // Super admin can access any brand (would need brandId param)
  if (userRole === 'superadmin') {
    const brandId = c.req.query('brandId') || c.req.param('brandId');
    if (brandId) {
      c.set('brandId', brandId);
      await next();
      return;
    }
  }

  // Get brand from brand_members
  const member = await db.getUserBrandMembership(userId);

  if (!member) {
    return c.json({ error: 'No brand access' }, 403);
  }

  c.set('brandId', member.brand_id);
  c.set('brandRole', member.role);
  await next();
}

brandRoutes.use('*', getUserBrand);

// Get brand dashboard stats
brandRoutes.get('/dashboard', async (c) => {
  const brandId = c.get('brandId') as string;

  // Get counts using direct queries
  const [modelsResult, inventoryResult, activationsResult, eventsResult, upcomingResult, templatesResult, membersResult] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM vehicle_models WHERE brand_id = ?').bind(brandId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM vehicle_inventory WHERE brand_id = ?').bind(brandId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM activations WHERE brand_id = ?').bind(brandId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM events WHERE brand_id = ?').bind(brandId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM events WHERE brand_id = ? AND start_at > datetime("now")').bind(brandId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM card_templates WHERE brand_id = ?').bind(brandId).first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM wallet_cards WHERE brand_id = ?').bind(brandId).first(),
  ]);

  return c.json({
    stats: {
      totalActivations: (activationsResult as any)?.count || 0,
      totalModels: (modelsResult as any)?.count || 0,
      totalInventory: (inventoryResult as any)?.count || 0,
      totalEvents: (eventsResult as any)?.count || 0,
      upcomingEvents: (upcomingResult as any)?.count || 0,
      totalCardTemplates: (templatesResult as any)?.count || 0,
      totalMembers: (membersResult as any)?.count || 0,
    },
  });
});

// Get brand analytics
brandRoutes.get('/analytics', async (c) => {
  const brandId = c.get('brandId') as string;
  const days = parseInt(c.req.query('days') || '30');
  const db = new Database(c.env.DB);

  const events = await db.getAnalyticsEvents(brandId, days);
  
  // Group by event type
  const eventsByType: Record<string, number> = {};
  events.forEach((event: any) => {
    eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
  });

  // Group by day
  const eventsByDay: Record<string, number> = {};
  events.forEach((event: any) => {
    const day = event.created_at.split('T')[0];
    eventsByDay[day] = (eventsByDay[day] || 0) + 1;
  });

  return c.json({
    eventsByType,
    eventsByDay,
    totalEvents: events.length,
  });
});

// Create post
brandRoutes.post('/posts', zValidator('json', createPostSchema), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const postId = generateId();
  await db.createPost({
    id: postId,
    brand_id: brandId,
    author_id: userId,
    type: data.type,
    title: data.title,
    content: data.content,
    image_url: data.imageUrl,
    video_url: data.videoUrl,
    is_pinned: data.isPinned || false,
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'post.create',
    resource_type: 'post',
    resource_id: postId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const post = await db.getPostById(postId);
  return c.json(post, 201);
});

// Update post
brandRoutes.patch('/posts/:id', zValidator('json', createPostSchema.partial()), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const postId = c.req.param('id');
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const post = await db.getPostById(postId);
  if (!post || post.brand_id !== brandId) {
    return c.json({ error: 'Post not found' }, 404);
  }

  await db.updatePost(postId, data);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'post.update',
    resource_type: 'post',
    resource_id: postId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const updatedPost = await db.getPostById(postId);
  return c.json(updatedPost);
});

// Delete post
brandRoutes.delete('/posts/:id', async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const postId = c.req.param('id');
  const db = new Database(c.env.DB);

  const post = await db.getPostById(postId);
  if (!post || post.brand_id !== brandId) {
    return c.json({ error: 'Post not found' }, 404);
  }

  await db.deletePost(postId);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'post.delete',
    resource_type: 'post',
    resource_id: postId,
    changes: {},
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Post deleted' });
});

// Create event
brandRoutes.post('/events', zValidator('json', createEventSchema), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const eventId = generateId();
  await db.createEvent({
    id: eventId,
    brand_id: brandId,
    type: data.type,
    title: data.title,
    description: data.description,
    image_url: data.imageUrl,
    city: data.city,
    location_text: data.locationText,
    start_at: data.startAt,
    end_at: data.endAt,
    capacity: data.capacity,
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'event.create',
    resource_type: 'event',
    resource_id: eventId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const event = await db.getEventById(eventId);
  return c.json(event, 201);
});

// Update event
brandRoutes.patch('/events/:id', zValidator('json', createEventSchema.partial()), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const eventId = c.req.param('id');
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const event = await db.getEventById(eventId);
  if (!event || event.brand_id !== brandId) {
    return c.json({ error: 'Event not found' }, 404);
  }

  await db.updateEvent(eventId, data);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'event.update',
    resource_type: 'event',
    resource_id: eventId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const updatedEvent = await db.getEventById(eventId);
  return c.json(updatedEvent);
});

// Delete event
brandRoutes.delete('/events/:id', async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const eventId = c.req.param('id');
  const db = new Database(c.env.DB);

  const event = await db.getEventById(eventId);
  if (!event || event.brand_id !== brandId) {
    return c.json({ error: 'Event not found' }, 404);
  }

  await db.deleteEvent(eventId);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'event.delete',
    resource_type: 'event',
    resource_id: eventId,
    changes: {},
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Event deleted' });
});

// Get pending reports
brandRoutes.get('/reports', async (c) => {
  const brandId = c.get('brandId') as string;
  const db = new Database(c.env.DB);

  const reports = await db.getBrandReports(brandId);

  return c.json({ reports });
});

// Review report
brandRoutes.patch('/reports/:id', async (c) => {
  const userId = c.get('userId') as string;
  const reportId = c.req.param('id');
  const { status } = await c.req.json();
  const db = new Database(c.env.DB);

  await db.updateReportStatus(reportId, status, userId);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'report.review',
    resource_type: 'post_report',
    resource_id: reportId,
    changes: { status },
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Report updated' });
});

// Get brand activations
brandRoutes.get('/activations', async (c) => {
  const brandId = c.get('brandId') as string;
  const db = new Database(c.env.DB);

  const activations = await db.getBrandActivations(brandId);

  return c.json({ activations });
});

// Product routes
brandRoutes.get('/products', async (c) => {
  const brandId = c.get('brandId') as string;
  const db = new Database(c.env.DB);

  const products = await db.getProducts(brandId);
  return c.json({ products });
});

brandRoutes.post('/products', zValidator('json', createProductSchema), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const productId = generateId();
  await db.createProduct({
    id: productId,
    brand_id: brandId,
    category: data.category,
    name: data.name,
    model: data.model,
    description: data.description,
    price: data.price,
    currency: data.currency,
    specifications: data.specifications,
    features: data.features,
    image_url: data.imageUrl,
    gallery_urls: data.galleryUrls,
    status: data.status,
    stock_quantity: data.stockQuantity,
    year: data.year,
  });

  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'product.create',
    resource_type: 'product',
    resource_id: productId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const product = await db.getProductById(productId);
  return c.json(product, 201);
});

brandRoutes.patch('/products/:id', zValidator('json', createProductSchema.partial()), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const productId = c.req.param('id');
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const product = await db.getProductById(productId);
  if (!product || product.brand_id !== brandId) {
    return c.json({ error: 'Product not found' }, 404);
  }

  await db.updateProduct(productId, data);

  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'product.update',
    resource_type: 'product',
    resource_id: productId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const updatedProduct = await db.getProductById(productId);
  return c.json(updatedProduct);
});

brandRoutes.delete('/products/:id', async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const productId = c.req.param('id');
  const db = new Database(c.env.DB);

  const product = await db.getProductById(productId);
  if (!product || product.brand_id !== brandId) {
    return c.json({ error: 'Product not found' }, 404);
  }

  await db.deleteProduct(productId);

  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'product.delete',
    resource_type: 'product',
    resource_id: productId,
    changes: {},
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Product deleted' });
});

// Card template routes
brandRoutes.get('/card-templates', async (c) => {
  const brandId = c.get('brandId') as string;
  const db = new Database(c.env.DB);

  const templates = await db.getCardTemplates(brandId);
  return c.json({ templates });
});

brandRoutes.post('/card-templates', zValidator('json', createCardTemplateSchema), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const templateId = generateId();
  await db.createCardTemplate({
    id: templateId,
    brand_id: brandId,
    name: data.name,
    tier: data.tier,
    design_config: data.designConfig,
    logo_url: data.logoUrl,
    background_gradient: data.backgroundGradient,
    text_color: data.textColor,
    benefits: data.benefits,
    unlock_conditions: data.unlockConditions,
  });

  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'card_template.create',
    resource_type: 'card_template',
    resource_id: templateId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const template = await db.getCardTemplateById(templateId);
  return c.json(template, 201);
});

brandRoutes.patch('/card-templates/:id', zValidator('json', createCardTemplateSchema.partial()), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const templateId = c.req.param('id');
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const template = await db.getCardTemplateById(templateId);
  if (!template || template.brand_id !== brandId) {
    return c.json({ error: 'Card template not found' }, 404);
  }

  await db.updateCardTemplate(templateId, data);

  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'card_template.update',
    resource_type: 'card_template',
    resource_id: templateId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const updatedTemplate = await db.getCardTemplateById(templateId);
  return c.json(updatedTemplate);
});

brandRoutes.delete('/card-templates/:id', async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const templateId = c.req.param('id');
  const db = new Database(c.env.DB);

  const template = await db.getCardTemplateById(templateId);
  if (!template || template.brand_id !== brandId) {
    return c.json({ error: 'Card template not found' }, 404);
  }

  await db.deleteCardTemplate(templateId);

  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'card_template.delete',
    resource_type: 'card_template',
    resource_id: templateId,
    changes: {},
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Card template deleted' });
});

// Wallet management routes
brandRoutes.get('/wallet/members', async (c) => {
  const brandId = c.get('brandId') as string;
  const db = new Database(c.env.DB);

  // Get all wallet cards for this brand
  const cards = await db.query(
    `SELECT 
      wc.*,
      u.name as user_name,
      u.email as user_email,
      ct.name as template_name,
      ct.tier as tier,
      ct.design_config,
      (SELECT COUNT(*) FROM activations WHERE user_id = wc.user_id AND status = 'verified') as activations_count,
      (SELECT COUNT(*) FROM event_rsvps WHERE user_id = wc.user_id AND status = 'going') as events_count
    FROM wallet_cards wc
    JOIN users u ON wc.user_id = u.id
    LEFT JOIN card_templates ct ON wc.template_id = ct.id
    WHERE wc.brand_id = ?
    ORDER BY wc.created_at DESC`,
    [brandId]
  );

  // Get templates for this brand
  const templates = await db.getCardTemplates(brandId);

  return c.json({ 
    cards,
    templates,
    totalMembers: cards.length
  });
});

brandRoutes.get('/wallet/members/:userId/progress', async (c) => {
  const brandId = c.get('brandId') as string;
  const targetUserId = c.req.param('userId');
  const db = new Database(c.env.DB);

  // Verify user has a card with this brand
  const userCard = await db.query(
    'SELECT * FROM wallet_cards WHERE user_id = ? AND brand_id = ?',
    [targetUserId, brandId]
  );

  if (!userCard || userCard.length === 0) {
    return c.json({ error: 'User card not found' }, 404);
  }

  // Get all templates for the brand
  const templates = await db.getCardTemplates(brandId);

  // Get user's activity data
  const [activations, eventRSVPs] = await Promise.all([
    db.getUserActivations(targetUserId),
    db.getUserRSVPs(targetUserId),
  ]);

  // Calculate progress for each template
  const templatesWithProgress = templates.map((template: any) => {
    const conditions = template.unlock_conditions?.conditions || [];
    const autoAssign = template.unlock_conditions?.autoAssign !== false;
    
    if (!autoAssign || conditions.length === 0) {
      return {
        ...template,
        progress: null,
        unlocked: template.tier === userCard[0].tier,
      };
    }

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
        
        case 'event':
          const relevantEvents = eventRSVPs.filter((rsvp: any) => 
            rsvp.status === 'going' && 
            (!condition.params?.eventType || rsvp.type === condition.params.eventType)
          );
          current = relevantEvents.length;
          required = condition.params?.minEvents || 1;
          met = current >= required;
          break;
        
        case 'purchase':
        case 'spending':
        case 'manual':
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
      ...template,
      progress: conditionProgress,
      unlocked: unlocked || template.tier === userCard[0].tier,
    };
  });

  return c.json({
    card: userCard[0],
    templates: templatesWithProgress,
    userProgress: {
      activations: activations.filter((a: any) => a.status === 'verified').length,
      events: eventRSVPs.filter((r: any) => r.status === 'going').length,
    },
  });
});

brandRoutes.post('/wallet/members/:userId/assign', async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.get('brandId') as string;
  const targetUserId = c.req.param('userId');
  const { templateId } = await c.req.json();
  const db = new Database(c.env.DB);

  // Verify template belongs to this brand
  const template = await db.getCardTemplateById(templateId);
  if (!template || template.brand_id !== brandId) {
    return c.json({ error: 'Template not found' }, 404);
  }

  // Update user's wallet card
  await db.query(
    'UPDATE wallet_cards SET template_id = ?, tier = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND brand_id = ?',
    [templateId, template.tier, targetUserId, brandId]
  );

  // Create wallet update notification
  await db.query(
    `INSERT INTO wallet_updates (id, user_id, brand_id, type, title, description, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      generateId(),
      targetUserId,
      brandId,
      'card_upgrade',
      'Nueva Tarjeta Asignada',
      `Tu tarjeta ha sido actualizada a ${template.name}`
    ]
  );

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'wallet.assign_card',
    resource_type: 'wallet_card',
    resource_id: targetUserId,
    changes: { templateId, tier: template.tier },
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Card assigned successfully' });
});
