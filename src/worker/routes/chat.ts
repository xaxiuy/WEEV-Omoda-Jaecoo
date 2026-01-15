import { Hono } from 'hono';
import type { Env, HonoContext } from '../types';
import { authMiddleware } from '../middleware/auth';
import { nanoid } from 'nanoid';

const chat = new Hono<{ Bindings: Env; Variables: HonoContext }>();

// Create a new chat thread
chat.post('/threads', authMiddleware, async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const db = c.env.DB;

  // Get user's brand from activations
  const activation = await db
    .prepare('SELECT brand_id FROM activations WHERE user_id = ? AND status = ? LIMIT 1')
    .bind(userId, 'verified')
    .first<{ brand_id: string }>();

  if (!activation) {
    return c.json({ error: 'No verified activation found' }, 400);
  }

  const threadId = nanoid();
  const now = new Date().toISOString();

  await db
    .prepare(
      'INSERT INTO chat_threads (id, user_id, brand_id, last_message_at, created_at) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(threadId, userId, activation.brand_id, now, now)
    .run();

  // Send welcome message
  const welcomeId = nanoid();
  await db
    .prepare('INSERT INTO chat_messages (id, thread_id, sender, content, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(
      welcomeId,
      threadId,
      'ai',
      '¡Hola! Soy tu asistente virtual de Omoda Jaecoo. ¿En qué puedo ayudarte hoy?',
      now
    )
    .run();

  return c.json({ threadId }, 201);
});

// Get thread messages
chat.get('/threads/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const threadId = c.req.param('id');
  const db = c.env.DB;

  // Verify thread belongs to user
  const thread = await db
    .prepare('SELECT id FROM chat_threads WHERE id = ? AND user_id = ?')
    .bind(threadId, userId)
    .first();

  if (!thread) {
    return c.json({ error: 'Thread not found' }, 404);
  }

  const messages = await db
    .prepare('SELECT id, sender, content, metadata, created_at FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC')
    .bind(threadId)
    .all();

  return c.json({ messages: messages.results });
});

// Send a message
chat.post('/threads/:id/messages', authMiddleware, async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const threadId = c.req.param('id');
  const db = c.env.DB;
  const body = await c.req.json();

  // Verify thread belongs to user
  const thread = await db
    .prepare('SELECT brand_id FROM chat_threads WHERE id = ? AND user_id = ?')
    .bind(threadId, userId)
    .first<{ brand_id: string }>();

  if (!thread) {
    return c.json({ error: 'Thread not found' }, 404);
  }

  const now = new Date().toISOString();
  const userMessageId = nanoid();

  // Save user message
  await db
    .prepare('INSERT INTO chat_messages (id, thread_id, sender, content, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(userMessageId, threadId, 'user', body.content, now)
    .run();

  // Simple KB retrieval - search for keywords
  const userContent = body.content.toLowerCase();
  const keywords = extractKeywords(userContent);
  
  let kbResults: any[] = [];
  if (keywords.length > 0) {
    // Search KB articles
    const kbQuery = await db
      .prepare(`
        SELECT id, title, content, category
        FROM knowledge_base_articles
        WHERE brand_id = ? AND published = 1
        ORDER BY created_at DESC
        LIMIT 5
      `)
      .bind(thread.brand_id)
      .all();

    kbResults = kbQuery.results.filter((article: any) => {
      const articleText = `${article.title} ${article.content}`.toLowerCase();
      return keywords.some(keyword => articleText.includes(keyword));
    });
  }

  // Generate response
  const aiMessageId = nanoid();
  let aiResponse = '';
  let actions: Array<{ type: string; url: string; label: string }> = [];

  if (kbResults.length > 0) {
    const article = kbResults[0] as any;
    aiResponse = `Encontré información sobre "${article.title}":\n\n${article.content.substring(0, 300)}...`;
    
    // Add relevant actions based on category
    if (article.category === 'maintenance' || article.category === 'service') {
      actions.push({
        type: 'book_service',
        url: '/events?type=service_clinic',
        label: 'Agendar Service'
      });
    }
    if (article.category === 'events') {
      actions.push({
        type: 'view_event',
        url: '/events',
        label: 'Ver Eventos'
      });
    }
  } else {
    // Default responses based on keywords
    if (keywords.some(k => ['service', 'mantenimiento', 'mantención'].includes(k))) {
      aiResponse = 'Para información sobre servicios de mantenimiento, te recomiendo revisar nuestros eventos de Service Clinic. ¿Te gustaría agendar uno?';
      actions.push({
        type: 'book_service',
        url: '/events?type=service_clinic',
        label: 'Ver Service Clinics'
      });
    } else if (keywords.some(k => ['evento', 'eventos', 'test drive'].includes(k))) {
      aiResponse = '¿Te gustaría conocer nuestros próximos eventos? Tenemos test drives y actividades especiales para la comunidad.';
      actions.push({
        type: 'view_event',
        url: '/events',
        label: 'Ver Eventos'
      });
    } else if (keywords.some(k => ['garantía', 'warranty'].includes(k))) {
      aiResponse = 'Para información sobre garantía, consulta la sección de documentación o contacta con nuestro equipo de soporte.';
      actions.push({
        type: 'open_brand_site',
        url: 'https://www.omodajaecoo.com.uy',
        label: 'Ir al Sitio Web'
      });
    } else {
      aiResponse = 'Entiendo tu consulta. ¿Puedes darme más detalles para poder ayudarte mejor? También puedes explorar nuestros eventos y beneficios.';
      actions.push({
        type: 'view_event',
        url: '/events',
        label: 'Ver Eventos'
      });
      actions.push({
        type: 'find_dealer',
        url: '/wallet',
        label: 'Contacto y Ubicaciones'
      });
    }
  }

  // Save AI response
  const metadata = actions.length > 0 ? JSON.stringify({ actions }) : null;
  await db
    .prepare('INSERT INTO chat_messages (id, thread_id, sender, content, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(aiMessageId, threadId, 'ai', aiResponse, metadata, now)
    .run();

  // Create trackable actions
  for (const action of actions) {
    const actionId = nanoid();
    const refCode = nanoid(10);
    await db
      .prepare(
        'INSERT INTO chat_actions (id, thread_id, user_id, action_type, destination_url, ref_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(actionId, threadId, userId, action.type, action.url, refCode, now)
      .run();
  }

  // Update thread last message time
  await db
    .prepare('UPDATE chat_threads SET last_message_at = ? WHERE id = ?')
    .bind(now, threadId)
    .run();

  // Track analytics
  await db
    .prepare(
      'INSERT INTO analytics_events (id, user_id, brand_id, event_type, event_data, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(nanoid(), userId, thread.brand_id, 'chat_message_sent', JSON.stringify({ threadId }), now)
    .run();

  return c.json({
    userMessage: {
      id: userMessageId,
      sender: 'user',
      content: body.content,
      createdAt: now
    },
    aiMessage: {
      id: aiMessageId,
      sender: 'ai',
      content: aiResponse,
      metadata: actions.length > 0 ? { actions } : null,
      createdAt: now
    }
  });
});

// Track action click
chat.post('/actions/:refCode/click', authMiddleware, async (c) => {
  const refCode = c.req.param('refCode');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const db = c.env.DB;

  const action = await db
    .prepare('SELECT id, thread_id, action_type FROM chat_actions WHERE ref_code = ? AND user_id = ?')
    .bind(refCode, userId)
    .first<{ id: string; thread_id: string; action_type: string }>();

  if (!action) {
    return c.json({ error: 'Action not found' }, 404);
  }

  const now = new Date().toISOString();

  await db
    .prepare('UPDATE chat_actions SET clicked = 1, clicked_at = ? WHERE id = ?')
    .bind(now, action.id)
    .run();

  // Track analytics
  await db
    .prepare(
      'INSERT INTO analytics_events (id, user_id, event_type, event_data, created_at) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(
      nanoid(),
      userId,
      'chat_action_clicked',
      JSON.stringify({ actionType: action.action_type, refCode }),
      now
    )
    .run();

  return c.json({ success: true });
});

// Get user's chat threads
chat.get('/threads', authMiddleware, async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const db = c.env.DB;

  const threads = await db
    .prepare(`
      SELECT 
        ct.id,
        ct.last_message_at,
        ct.created_at,
        b.name as brand_name,
        b.logo_url as brand_logo
      FROM chat_threads ct
      JOIN brands b ON ct.brand_id = b.id
      WHERE ct.user_id = ?
      ORDER BY ct.last_message_at DESC
    `)
    .bind(userId)
    .all();

  return c.json({ threads: threads.results });
});

// Helper function to extract keywords
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'por', 'con', 'para', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'son', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'también', 'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'están', 'durante', 'hoy', 'siempre', 'puede', 'ver', 'sus', 'les', 'mi', 'qué', 'solo', 'ni', 'yo', 'si', 'ti', 'te', 'tu', 'tú']);
  
  return words
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 10);
}

export const chatRoutes = chat;
