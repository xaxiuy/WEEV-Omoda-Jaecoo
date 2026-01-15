import { Context, Next } from 'hono';
import { verifyAccessToken } from '../lib/crypto';
import { Database } from '../lib/db';
import type { Env, HonoContext } from '../types';

export interface AuthContext {
  userId: string;
  role: string;
  user?: any;
}

type AuthEnv = { Bindings: Env; Variables: HonoContext };

export async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = verifyAccessToken(token, jwtSecret);
    
    // Attach user info to context
    c.set('userId', payload.userId);
    c.set('role', payload.role);

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}

export async function optionalAuthMiddleware(c: Context<AuthEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const jwtSecret = c.env.JWT_SECRET;
      if (jwtSecret) {
        const payload = verifyAccessToken(token, jwtSecret);
        c.set('userId', payload.userId);
        c.set('role', payload.role);
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }

  await next();
}

export function requireRole(allowedRoles: string[]) {
  return async (c: Context<AuthEnv>, next: Next) => {
    const role = c.get('role') as string;
    
    if (!role || !allowedRoles.includes(role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await next();
  };
}

export function requireBrandAccess(requiredRoles: string[] = ['brand_admin', 'brand_member']) {
  return async (c: Context<AuthEnv>, next: Next) => {
    const userId = c.get('userId') as string;
    const userRole = c.get('role') as string;
    
    // SuperAdmin can access everything
    if (userRole === 'superadmin') {
      await next();
      return;
    }

    const brandId = c.req.param('brandId') || c.req.query('brandId');
    
    if (!brandId) {
      return c.json({ error: 'Brand ID required' }, 400);
    }

    const db = new Database(c.env.DB);
    const memberRole = await db.getBrandMemberRole(brandId, userId);

    if (!memberRole || !requiredRoles.includes(memberRole)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('brandId', brandId);
    c.set('brandRole', memberRole);

    await next();
  };
}
