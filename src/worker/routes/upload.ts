import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { generateId } from '../lib/crypto';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

export const uploadRoutes = new Hono<AuthEnv>();

uploadRoutes.use('*', authMiddleware);

// Upload image
uploadRoutes.post('/image', async (c) => {
  const userId = c.get('userId') as string;
  const userRole = c.get('role') as string;

  // Only brand admins and superadmins can upload
  if (userRole !== 'brand_admin' && userRole !== 'superadmin') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const namespace = formData.get('namespace') as string || 'general';

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only images are allowed.' }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomId = generateId().substring(0, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const key = `${namespace}/${timestamp}-${randomId}.${extension}`;

    // Upload to R2
    await c.env.R2_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        uploadedBy: userId,
        originalName: file.name,
      },
    });

    // Return URL (we'll serve it through our API)
    const url = `/api/files/${key}`;

    return c.json({ url, key });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Get file
uploadRoutes.get('/files/*', async (c) => {
  try {
    const key = c.req.path.replace('/api/files/', '');
    
    const object = await c.env.R2_BUCKET.get(key);
    
    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000');

    return c.body(object.body, { headers });
  } catch (error) {
    console.error('File retrieval error:', error);
    return c.json({ error: 'File not found' }, 404);
  }
});

// Delete file (for cleanup)
uploadRoutes.delete('/files/:key', async (c) => {
  const userRole = c.get('role') as string;

  if (userRole !== 'brand_admin' && userRole !== 'superadmin') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const key = c.req.param('key');
    await c.env.R2_BUCKET.delete(key);
    return c.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return c.json({ error: 'Delete failed' }, 500);
  }
});
