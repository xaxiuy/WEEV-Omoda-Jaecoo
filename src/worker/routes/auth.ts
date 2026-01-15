import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, generateId, hashToken } from '../lib/crypto';
import { Database } from '../lib/db';
import { authMiddleware } from '../middleware/auth';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const authRoutes = new Hono<AuthEnv>();

// Signup
authRoutes.post('/signup', zValidator('json', signupSchema), async (c) => {
  const { email, password, name, phone, city } = c.req.valid('json');
  
  const db = new Database(c.env.DB);

  // Check if user exists
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    return c.json({ error: 'Email already registered' }, 400);
  }

  // Create user
  const userId = generateId();
  const passwordHash = await hashPassword(password);

  await db.createUser({
    id: userId,
    email,
    password_hash: passwordHash,
    name,
    phone,
    city,
    role: 'user',
  });

  // Create tokens
  const jwtSecret = c.env.JWT_SECRET;
  const refreshSecret = c.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !refreshSecret) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  const accessToken = generateAccessToken(userId, 'user', jwtSecret);
  const refreshToken = generateRefreshToken(userId, refreshSecret);
  const tokenHash = await hashToken(refreshToken);

  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.createRefreshToken({
    id: generateId(),
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'user.signup',
    resource_type: 'user',
    resource_id: userId,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({
    accessToken,
    refreshToken,
    user: {
      id: userId,
      email,
      name,
      role: 'user',
    },
  }, 201);
});

// Login
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  const db = new Database(c.env.DB);

  // Get user
  const user = await db.getUserByEmail(email);
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Check status
  if (user.status !== 'active') {
    return c.json({ error: 'Account is not active' }, 403);
  }

  // Create tokens
  const jwtSecret = c.env.JWT_SECRET;
  const refreshSecret = c.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !refreshSecret) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  const accessToken = generateAccessToken(user.id, user.role, jwtSecret);
  const refreshToken = generateRefreshToken(user.id, refreshSecret);
  const tokenHash = await hashToken(refreshToken);

  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.createRefreshToken({
    id: generateId(),
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: user.id,
    action: 'user.login',
    resource_type: 'user',
    resource_id: user.id,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// Refresh
authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  
  const db = new Database(c.env.DB);
  const refreshSecret = c.env.JWT_REFRESH_SECRET;

  if (!refreshSecret) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  const tokenHash = await hashToken(refreshToken);
  const storedToken = await db.getRefreshToken(tokenHash);

  if (!storedToken) {
    return c.json({ error: 'Invalid refresh token' }, 401);
  }

  // Get user
  const user = await db.getUserById(storedToken.user_id);
  if (!user || user.status !== 'active') {
    return c.json({ error: 'User not found or inactive' }, 401);
  }

  // Generate new access token
  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  const accessToken = generateAccessToken(user.id, user.role, jwtSecret);

  return c.json({ accessToken });
});

// Logout
authRoutes.post('/logout', authMiddleware, zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const userId = c.get('userId') as string;
  
  const db = new Database(c.env.DB);
  const tokenHash = await hashToken(refreshToken);
  
  await db.revokeRefreshToken(tokenHash);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'user.logout',
    resource_type: 'user',
    resource_id: userId,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Logged out successfully' });
});

// Get current user
authRoutes.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const db = new Database(c.env.DB);
  
  const user = await db.getUserById(userId);
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    city: user.city,
    role: user.role,
    emailVerified: user.email_verified === 1,
    createdAt: user.created_at,
  });
});
