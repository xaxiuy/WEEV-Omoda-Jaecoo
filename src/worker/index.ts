import { Hono } from "hono";
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { activationRoutes } from './routes/activations';
import { feedRoutes } from './routes/feed';
import { eventRoutes } from './routes/events';
import { walletRoutes } from './routes/wallet';
import { brandRoutes } from './routes/brand';
import { adminRoutes } from './routes/admin';
import { chatRoutes } from './routes/chat';
import { uploadRoutes } from './routes/upload';
import { vehicleRoutes } from './routes/vehicles';
import { notificationsRoutes } from './routes/notifications';
import { dashboardRoutes } from './routes/dashboard';
import type { Env, HonoContext } from './types';

const app = new Hono<{ Bindings: Env; Variables: HonoContext }>();

// CORS
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://*.mocha.build'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/activations', activationRoutes);
app.route('/api/feed', feedRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/wallet', walletRoutes);
app.route('/api/brand', brandRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/chat', chatRoutes);
app.route('/api/vehicles', vehicleRoutes);
app.route('/api/notifications', notificationsRoutes);
app.route('/api/user/dashboard', dashboardRoutes);
app.route('/api', uploadRoutes);

export default app;
