import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { Database } from '../lib/db';
import { generateId } from '../lib/crypto';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export const userRoutes = new Hono<AuthEnv>();

userRoutes.use('*', authMiddleware);

// Update current user profile
userRoutes.patch('/me', zValidator('json', updateProfileSchema), async (c) => {
  const userId = c.get('userId') as string;
  const updates = c.req.valid('json');
  
  const db = new Database(c.env.DB);
  
  await db.updateUser(userId, updates);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'user.update',
    resource_type: 'user',
    resource_id: userId,
    changes: updates,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const user = await db.getUserById(userId);
  
  return c.json({
    id: user!.id,
    email: user!.email,
    name: user!.name,
    phone: user!.phone,
    city: user!.city,
    role: user!.role,
  });
});
