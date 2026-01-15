import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { Database } from '../lib/db';
import { generateId } from '../lib/crypto';
import { createNotification } from './notifications';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

const rsvpSchema = z.object({
  status: z.enum(['going', 'interested', 'cancelled']),
});

export const eventRoutes = new Hono<AuthEnv>();

// Get events list
eventRoutes.get('/', optionalAuthMiddleware, async (c) => {
  const userId = c.get('userId') as string | undefined;
  const brandId = c.req.query('brandId');
  const city = c.req.query('city');
  const type = c.req.query('type');
  const upcoming = c.req.query('upcoming') === 'true';
  
  const db = new Database(c.env.DB);

  const events = await db.getEvents({ brandId, city, type, upcoming, userId });

  return c.json({ events });
});

// Get single event
eventRoutes.get('/:id', optionalAuthMiddleware, async (c) => {
  const userId = c.get('userId') as string | undefined;
  const eventId = c.req.param('id');
  const db = new Database(c.env.DB);

  const event = await db.getEventById(eventId, userId);

  if (!event) {
    return c.json({ error: 'Event not found' }, 404);
  }

  return c.json(event);
});

// RSVP to event
eventRoutes.post('/:id/rsvp', authMiddleware, zValidator('json', rsvpSchema), async (c) => {
  const userId = c.get('userId') as string;
  const eventId = c.req.param('id');
  const { status } = c.req.valid('json');
  const db = new Database(c.env.DB);

  const event = await db.getEventById(eventId);
  if (!event) {
    return c.json({ error: 'Event not found' }, 404);
  }

  // Check capacity
  if (status === 'going' && event.capacity && event.rsvp_count >= event.capacity) {
    return c.json({ error: 'Event is at full capacity' }, 400);
  }

  // Create or update RSVP
  await db.createOrUpdateRSVP({
    event_id: eventId,
    user_id: userId,
    status,
  });

  // Create wallet update if going
  if (status === 'going') {
    await db.createWalletUpdate({
      id: generateId(),
      user_id: userId,
      brand_id: event.brand_id,
      type: 'event',
      title: 'Event RSVP Confirmed',
      description: `You're going to ${event.title}`,
      action_url: `/events/${eventId}`,
    });

    // Create notification
    await createNotification(c.env.DB, {
      userId,
      brandId: event.brand_id,
      type: 'event_reminder',
      title: 'Evento Confirmado',
      message: `Confirmaste tu asistencia a ${event.title}. ¡Te esperamos!`,
      actionUrl: `/events/${eventId}`,
      imageUrl: event.image_url,
    });
  }

  // Analytics
  await db.createAnalyticsEvent({
    id: generateId(),
    user_id: userId,
    brand_id: event.brand_id,
    event_type: 'event_rsvp',
    event_data: { event_id: eventId, status },
  });

  return c.json({ message: 'RSVP updated', status });
});

// Get user's RSVPs
eventRoutes.get('/me/rsvps', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const db = new Database(c.env.DB);

  const rsvps = await db.getUserRSVPs(userId);

  return c.json({ rsvps });
});
