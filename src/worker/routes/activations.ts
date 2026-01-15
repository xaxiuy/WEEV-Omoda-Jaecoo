import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { Database } from '../lib/db';
import { generateId } from '../lib/crypto';
import { createNotification } from './notifications';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

const createActivationSchema = z.object({
  brandId: z.string(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  verificationMethod: z.enum(['vin', 'license_plate', 'qr', 'manual']),
});

export const activationRoutes = new Hono<AuthEnv>();

activationRoutes.use('*', authMiddleware);

// Create activation
activationRoutes.post('/', zValidator('json', createActivationSchema), async (c) => {
  const userId = c.get('userId') as string;
  const data = c.req.valid('json');
  const db = new Database(c.env.DB);

  // Check if user already has an activation for this brand
  const existing = await db.getUserActivationByBrand(userId, data.brandId);
  if (existing) {
    return c.json({ error: 'You already have an activation for this brand' }, 400);
  }

  // Create activation
  const activationId = generateId();
  await db.createActivation({
    id: activationId,
    user_id: userId,
    brand_id: data.brandId,
    vin: data.vin,
    license_plate: data.licensePlate,
    model: data.model,
    year: data.year,
    verification_method: data.verificationMethod,
    status: 'verified', // Auto-verify for now
  });

  // Create or update wallet card
  const brand = await db.getBrandById(data.brandId);
  
  const memberId = `${brand!.slug.toUpperCase()}-${userId.substring(0, 8).toUpperCase()}`;
  await db.createOrUpdateWalletCard({
    user_id: userId,
    brand_id: data.brandId,
    member_id: memberId,
    tier: 'member',
    activation_id: activationId,
  });

  // Create wallet update
  await db.createWalletUpdate({
    id: generateId(),
    user_id: userId,
    brand_id: data.brandId,
    type: 'activation',
    title: 'Vehicle Activated',
    description: `Your ${data.model || 'vehicle'} has been activated successfully`,
  });

  // Analytics event
  await db.createAnalyticsEvent({
    id: generateId(),
    user_id: userId,
    brand_id: data.brandId,
    event_type: 'activation_created',
    event_data: { verification_method: data.verificationMethod, model: data.model },
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'activation.create',
    resource_type: 'activation',
    resource_id: activationId,
    changes: data,
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  // Create notification
  await createNotification(c.env.DB, {
    userId,
    brandId: data.brandId,
    type: 'activation_success',
    title: '¡Activación Exitosa!',
    message: `Tu ${data.model || 'vehículo'} ha sido activado. Ya eres parte de ${brand!.name}.`,
    actionUrl: '/wallet',
  });

  const activation = await db.getActivationById(activationId);
  const walletCard = await db.getWalletCardByUserId(userId);

  return c.json({
    activation,
    walletCard,
  }, 201);
});

// Get current user's activations
activationRoutes.get('/me', async (c) => {
  const userId = c.get('userId') as string;
  const db = new Database(c.env.DB);

  const activations = await db.getUserActivations(userId);

  return c.json({ activations });
});

// Get activation by ID
activationRoutes.get('/:id', async (c) => {
  const userId = c.get('userId') as string;
  const activationId = c.req.param('id');
  const db = new Database(c.env.DB);

  const activation = await db.getActivationById(activationId);

  if (!activation) {
    return c.json({ error: 'Activation not found' }, 404);
  }

  if (activation.user_id !== userId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  return c.json(activation);
});
