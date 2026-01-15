import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { Database } from '../lib/db';
import { generateId } from '../lib/crypto';
import type { Env, HonoContext } from '../types';

type AuthEnv = { Bindings: Env; Variables: HonoContext };

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

const createReportSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'harassment', 'other']),
  description: z.string().optional(),
});

export const feedRoutes = new Hono<AuthEnv>();

// Get feed (public, but shows like status if authenticated)
feedRoutes.get('/', optionalAuthMiddleware, async (c) => {
  const userId = c.get('userId') as string | undefined;
  const brandId = c.req.query('brandId');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  
  const db = new Database(c.env.DB);

  const posts = await db.getFeedPosts({ brandId, limit, offset, userId });

  return c.json({ posts, hasMore: posts.length === limit });
});

// Get single post
feedRoutes.get('/posts/:id', optionalAuthMiddleware, async (c) => {
  const userId = c.get('userId') as string | undefined;
  const postId = c.req.param('id');
  const db = new Database(c.env.DB);

  const post = await db.getPostById(postId, userId);

  if (!post) {
    return c.json({ error: 'Post not found' }, 404);
  }

  return c.json(post);
});

// Like a post
feedRoutes.post('/posts/:id/like', authMiddleware, async (c) => {
  const userId = c.get('userId') as string;
  const postId = c.req.param('id');
  const db = new Database(c.env.DB);

  const post = await db.getPostById(postId);
  if (!post) {
    return c.json({ error: 'Post not found' }, 404);
  }

  // Toggle like
  const liked = await db.togglePostLike(postId, userId);

  // Analytics
  if (liked) {
    await db.createAnalyticsEvent({
      id: generateId(),
      user_id: userId,
      brand_id: post.brand_id,
      event_type: 'post_like',
      event_data: { post_id: postId },
    });
  }

  return c.json({ liked });
});

// Comment on a post
feedRoutes.post('/posts/:id/comments', authMiddleware, zValidator('json', createCommentSchema), async (c) => {
  const userId = c.get('userId') as string;
  const postId = c.req.param('id');
  const { content } = c.req.valid('json');
  const db = new Database(c.env.DB);

  const post = await db.getPostById(postId);
  if (!post) {
    return c.json({ error: 'Post not found' }, 404);
  }

  const commentId = generateId();
  await db.createComment({
    id: commentId,
    post_id: postId,
    user_id: userId,
    content,
  });

  // Analytics
  await db.createAnalyticsEvent({
    id: generateId(),
    user_id: userId,
    brand_id: post.brand_id,
    event_type: 'comment_create',
    event_data: { post_id: postId },
  });

  const comment = await db.getCommentById(commentId);

  return c.json(comment, 201);
});

// Get post comments
feedRoutes.get('/posts/:id/comments', optionalAuthMiddleware, async (c) => {
  const postId = c.req.param('id');
  const db = new Database(c.env.DB);

  const comments = await db.getPostComments(postId);

  return c.json({ comments });
});

// Report a post
feedRoutes.post('/posts/:id/report', authMiddleware, zValidator('json', createReportSchema), async (c) => {
  const userId = c.get('userId') as string;
  const postId = c.req.param('id');
  const { reason, description } = c.req.valid('json');
  const db = new Database(c.env.DB);

  const post = await db.getPostById(postId);
  if (!post) {
    return c.json({ error: 'Post not found' }, 404);
  }

  const reportId = generateId();
  await db.createPostReport({
    id: reportId,
    post_id: postId,
    user_id: userId,
    reason,
    description,
    status: 'pending',
  });

  // Audit log
  await db.createAuditLog({
    id: generateId(),
    user_id: userId,
    action: 'post.report',
    resource_type: 'post',
    resource_id: postId,
    changes: { reason, description },
    ip_address: c.req.header('CF-Connecting-IP'),
    user_agent: c.req.header('User-Agent'),
  });

  return c.json({ message: 'Report submitted' }, 201);
});
