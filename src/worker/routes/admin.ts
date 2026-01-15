import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';
import { Database } from '../lib/db';
import { generateId, hashPassword } from '../lib/crypto';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  websiteUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  industry: z.string().optional(),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['user', 'brand_admin', 'superadmin']),
});

const addBrandMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['brand_admin', 'brand_member']),
});

export const adminRoutes = new Hono<AuthEnv>();

adminRoutes.use('*', authMiddleware);
adminRoutes.use('*', requireRole(['superadmin']));

// Get all brands
adminRoutes.get('/brands', async (c) => {
  const db = new Database(c.env.DB);
  const brands = await db.getAllBrands();
  return c.json({ brands });
});

// Create brand
adminRoutes.post('/brands', zValidator('json', createBrandSchema), async (c) => {
  const userId = c.get('userId') as string;
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  // Check if slug already exists
  const existing = await db.getBrandBySlug(data.slug);
  if (existing) {
    return c.json({ error: 'Brand slug already exists' }, 400);
  }

  const brandId = generateId();
  await db.createBrand({
    id: brandId,
    name: data.name,
    slug: data.slug,
    website_url: data.websiteUrl,
    logo_url: data.logoUrl,
    industry: data.industry,
    status: 'verified',
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'brand.create',
    resource_type: 'brand',
    resource_id: brandId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const brand = await db.getBrandById(brandId);
  return c.json(brand, 201);
});

// Update brand
adminRoutes.patch('/brands/:id', zValidator('json', createBrandSchema.partial()), async (c) => {
  const userId = c.get('userId') as string;
  const brandId = c.req.param('id');
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  const brand = await db.getBrandById(brandId);
  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  await db.updateBrand(brandId, data);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'brand.update',
    resource_type: 'brand',
    resource_id: brandId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const updatedBrand = await db.getBrandById(brandId);
  return c.json(updatedBrand);
});

// Get all users
adminRoutes.get('/users', async (c) => {
  const db = new Database(c.env.DB);
  const users = await db.getAllUsers();
  return c.json({ users });
});

// Create user
adminRoutes.post('/users', zValidator('json', createUserSchema), async (c) => {
  const userId = c.get('userId') as string;
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  // Check if email exists
  const existing = await db.getUserByEmail(data.email);
  if (existing) {
    return c.json({ error: 'Email already exists' }, 400);
  }

  const newUserId = generateId();
  const passwordHash = await hashPassword(data.password);

  await db.createUser({
    id: newUserId,
    email: data.email,
    password_hash: passwordHash,
    name: data.name,
    role: data.role,
    status: 'active',
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'user.create',
    resource_type: 'user',
    resource_id: newUserId,
    changes: { email: data.email, name: data.name, role: data.role },
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const user = await db.getUserById(newUserId);
  return c.json(user, 201);
});

// Update user
adminRoutes.patch('/users/:id', async (c) => {
  const adminUserId = c.get('userId') as string;
  const targetUserId = c.req.param('id');
  const { role, status } = await c.req.json();
  const db = new Database(c.env.DB);

  const user = await db.getUserById(targetUserId);
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  await db.updateUserRoleStatus(targetUserId, role, status);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: adminUserId,
    action: 'user.update',
    resource_type: 'user',
    resource_id: targetUserId,
    changes: { role, status },
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  const updatedUser = await db.getUserById(targetUserId);
  return c.json(updatedUser);
});

// Add brand member
adminRoutes.post('/brands/:brandId/members', zValidator('json', addBrandMemberSchema), async (c) => {
  const adminUserId = c.get('userId') as string;
  const brandId = c.req.param('brandId');
  const { userId, role } = c.req.valid('json');
  const db = new Database(c.env.DB);

  const brand = await db.getBrandById(brandId);
  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  const user = await db.getUserById(userId);
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  const memberId = generateId();
  await db.addBrandMember({
    id: memberId,
    brand_id: brandId,
    user_id: userId,
    role,
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: adminUserId,
    action: 'brand_member.add',
    resource_type: 'brand_member',
    resource_id: memberId,
    changes: { brand_id: brandId, user_id: userId, role },
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Member added successfully' }, 201);
});

// Remove brand member
adminRoutes.delete('/brands/:brandId/members/:userId', async (c) => {
  const adminUserId = c.get('userId') as string;
  const brandId = c.req.param('brandId');
  const userId = c.req.param('userId');
  const db = new Database(c.env.DB);

  await db.removeBrandMember(brandId, userId);

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: adminUserId,
    action: 'brand_member.remove',
    resource_type: 'brand_member',
    resource_id: userId,
    changes: { brand_id: brandId, user_id: userId },
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Member removed successfully' });
});

// Get audit logs
adminRoutes.get('/audit-logs', async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const db = new Database(c.env.DB);

  const logs = await db.getAuditLogs(limit, offset);

  return c.json({ logs, hasMore: logs.length === limit });
});

// Get system stats
adminRoutes.get('/stats', async (c) => {
  const db = new Database(c.env.DB);

  const [
    totalUsers,
    totalBrands,
    totalActivations,
    totalPosts,
    totalEvents,
  ] = await Promise.all([
    db.countAllUsers(),
    db.countAllBrands(),
    db.countAllActivations(),
    db.countAllPosts(),
    db.countAllEvents(),
  ]);

  return c.json({
    stats: {
      totalUsers,
      totalBrands,
      totalActivations,
      totalPosts,
      totalEvents,
    },
  });
});
