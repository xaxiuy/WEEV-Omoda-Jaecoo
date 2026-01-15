import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { generateId } from '../lib/crypto';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

export const notificationsRoutes = new Hono<AuthEnv>();

notificationsRoutes.use('*', authMiddleware);

// Get user notifications
notificationsRoutes.get('/', async (c) => {
  const userId = c.get('userId') as string;
  const limit = parseInt(c.req.query('limit') || '50');

  const notifications = await c.env.DB.prepare(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`
  )
    .bind(userId, limit)
    .all();

  return c.json({
    notifications: notifications.results.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      actionUrl: n.action_url,
      imageUrl: n.image_url,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
    })),
  });
});

// Mark notification as read
notificationsRoutes.post('/:id/read', async (c) => {
  const userId = c.get('userId') as string;
  const notificationId = c.req.param('id');

  await c.env.DB.prepare(
    'UPDATE notifications SET is_read = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  )
    .bind(notificationId, userId)
    .run();

  return c.json({ message: 'Marked as read' });
});

// Mark all notifications as read
notificationsRoutes.post('/read-all', async (c) => {
  const userId = c.get('userId') as string;

  await c.env.DB.prepare(
    'UPDATE notifications SET is_read = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = 0'
  )
    .bind(userId)
    .run();

  return c.json({ message: 'All marked as read' });
});

// Helper function to create notification (exported for use in other routes)
export async function createNotification(
  db: D1Database,
  data: {
    userId: string;
    brandId?: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    imageUrl?: string;
  }
) {
  const id = generateId();
  await db
    .prepare(
      `INSERT INTO notifications (id, user_id, brand_id, type, title, message, action_url, image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(
      id,
      data.userId,
      data.brandId || null,
      data.type,
      data.title,
      data.message,
      data.actionUrl || null,
      data.imageUrl || null
    )
    .run();
  
  return id;
}
