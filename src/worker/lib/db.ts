// D1Database type is globally available

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  role: string;
  status: string;
  email_verified: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  industry: string | null;
  description: string | null;
  status: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandMember {
  id: string;
  brand_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked: number;
  created_at: string;
}

export interface Activation {
  id: string;
  user_id: string;
  brand_id: string;
  vin: string | null;
  license_plate: string | null;
  model: string | null;
  year: number | null;
  verification_method: string;
  status: string;
  verified_at: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletCard {
  id: string;
  user_id: string;
  brand_id: string;
  member_id: string;
  tier: string;
  activation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  brand_id: string | null;
  event_type: string;
  event_data: string | null;
  session_id: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  brand_id: string;
  author_id: string | null;
  type: string;
  title: string | null;
  content: string;
  image_url: string | null;
  video_url: string | null;
  is_pinned: number;
  published: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PostReport {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  brand_id: string;
  type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  city: string | null;
  location_text: string | null;
  start_at: string;
  end_at: string;
  capacity: number | null;
  rsvp_count: number;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WalletUpdate {
  id: string;
  user_id: string;
  brand_id: string;
  type: string;
  title: string;
  description: string | null;
  action_url: string | null;
  is_read: number;
  created_at: string;
}

export class Database {
  constructor(private db: D1Database) {}

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const result = await this.db.prepare(sql).bind(...params).all();
    return result.results || [];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.db.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();
  }

  async createUser(data: {
    id: string;
    email: string;
    password_hash: string;
    name?: string;
    phone?: string;
    city?: string;
    role?: string;
    status?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, phone, city, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.email,
      data.password_hash,
      data.name || null,
      data.phone || null,
      data.city || null,
      data.role || 'user',
      data.status || 'active'
    ).run();
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();
  }

  async createRefreshToken(data: {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(data.id, data.user_id, data.token_hash, data.expires_at).run();
  }

  async getRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return await this.db.prepare(`
      SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > datetime('now')
    `).bind(tokenHash).first<RefreshToken>();
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.db.prepare(`
      UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?
    `).bind(tokenHash).run();
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?
    `).bind(userId).run();
  }

  async getBrandById(id: string): Promise<Brand | null> {
    return await this.db.prepare('SELECT * FROM brands WHERE id = ?')
      .bind(id)
      .first<Brand>();
  }

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    return await this.db.prepare('SELECT * FROM brands WHERE slug = ?')
      .bind(slug)
      .first<Brand>();
  }

  async getBrandMemberRole(brandId: string, userId: string): Promise<string | null> {
    const member = await this.db.prepare(`
      SELECT role FROM brand_members WHERE brand_id = ? AND user_id = ?
    `).bind(brandId, userId).first<{ role: string }>();
    
    return member?.role || null;
  }

  async getUserBrandMembership(userId: string): Promise<{ brand_id: string; role: string } | null> {
    return await this.db.prepare(`
      SELECT brand_id, role FROM brand_members WHERE user_id = ? LIMIT 1
    `).bind(userId).first<{ brand_id: string; role: string }>();
  }

  async createAuditLog(data: {
    id: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    changes?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, changes, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.user_id || null,
      data.action,
      data.resource_type,
      data.resource_id || null,
      data.changes ? JSON.stringify(data.changes) : null,
      data.ip_address || null,
      data.user_agent || null
    ).run();
  }

  async createAnalyticsEvent(data: {
    id: string;
    user_id?: string;
    brand_id?: string;
    event_type: string;
    event_data?: any;
    session_id?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO analytics_events (id, user_id, brand_id, event_type, event_data, session_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.user_id || null,
      data.brand_id || null,
      data.event_type,
      data.event_data ? JSON.stringify(data.event_data) : null,
      data.session_id || null
    ).run();
  }

  // Activation methods
  async createActivation(data: {
    id: string;
    user_id: string;
    brand_id: string;
    vin?: string;
    license_plate?: string;
    model?: string;
    year?: number;
    verification_method: string;
    status: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO activations (id, user_id, brand_id, vin, license_plate, model, year, verification_method, status, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      data.id,
      data.user_id,
      data.brand_id,
      data.vin || null,
      data.license_plate || null,
      data.model || null,
      data.year || null,
      data.verification_method,
      data.status
    ).run();
  }

  async getActivationById(id: string): Promise<Activation | null> {
    return await this.db.prepare('SELECT * FROM activations WHERE id = ?')
      .bind(id)
      .first<Activation>();
  }

  async getUserActivations(userId: string): Promise<Activation[]> {
    const result = await this.db.prepare('SELECT * FROM activations WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<Activation>();
    return result.results || [];
  }

  async getUserActivationByBrand(userId: string, brandId: string): Promise<Activation | null> {
    return await this.db.prepare('SELECT * FROM activations WHERE user_id = ? AND brand_id = ?')
      .bind(userId, brandId)
      .first<Activation>();
  }

  // Wallet methods
  async createOrUpdateWalletCard(data: {
    user_id: string;
    brand_id: string;
    member_id: string;
    tier: string;
    activation_id?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO wallet_cards (id, user_id, brand_id, member_id, tier, activation_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        member_id = excluded.member_id,
        tier = excluded.tier,
        activation_id = excluded.activation_id,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      crypto.randomUUID(),
      data.user_id,
      data.brand_id,
      data.member_id,
      data.tier,
      data.activation_id || null
    ).run();
  }

  async getWalletCardByUserId(userId: string): Promise<WalletCard | null> {
    return await this.db.prepare('SELECT * FROM wallet_cards WHERE user_id = ?')
      .bind(userId)
      .first<WalletCard>();
  }

  async createWalletUpdate(data: {
    id: string;
    user_id: string;
    brand_id: string;
    type: string;
    title: string;
    description?: string;
    action_url?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO wallet_updates (id, user_id, brand_id, type, title, description, action_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.user_id,
      data.brand_id,
      data.type,
      data.title,
      data.description || null,
      data.action_url || null
    ).run();
  }

  async getWalletUpdates(userId: string, limit: number, offset: number): Promise<WalletUpdate[]> {
    const result = await this.db.prepare(`
      SELECT * FROM wallet_updates 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all<WalletUpdate>();
    return result.results || [];
  }

  async markWalletUpdateAsRead(updateId: string, userId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE wallet_updates SET is_read = 1 WHERE id = ? AND user_id = ?
    `).bind(updateId, userId).run();
  }

  // Feed methods
  async getFeedPosts(options: {
    brandId?: string;
    limit: number;
    offset: number;
    userId?: string;
  }): Promise<any[]> {
    let query = `
      SELECT p.*, 
             u.name as author_name,
             b.name as brand_name,
             b.logo_url as brand_logo_url,
             ${options.userId ? `(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked` : '0 as user_liked'}
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.published = 1
    `;
    const params: any[] = [];
    
    if (options.userId) {
      params.push(options.userId);
    }

    if (options.brandId) {
      query += ' AND p.brand_id = ?';
      params.push(options.brandId);
    }

    query += ' ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT ? OFFSET ?';
    params.push(options.limit, options.offset);

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results || [];
  }

  async getPostById(id: string, userId?: string): Promise<any | null> {
    const query = `
      SELECT p.*, 
             u.name as author_name,
             b.name as brand_name,
             b.logo_url as brand_logo_url,
             ${userId ? `(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked` : '0 as user_liked'}
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `;
    const params = userId ? [userId, id] : [id];
    return await this.db.prepare(query).bind(...params).first();
  }

  async togglePostLike(postId: string, userId: string): Promise<boolean> {
    const existing = await this.db.prepare(`
      SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?
    `).bind(postId, userId).first();

    if (existing) {
      // Unlike
      await this.db.prepare(`DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`)
        .bind(postId, userId).run();
      await this.db.prepare(`UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?`)
        .bind(postId).run();
      return false;
    } else {
      // Like
      await this.db.prepare(`
        INSERT INTO post_likes (id, post_id, user_id) VALUES (?, ?, ?)
      `).bind(crypto.randomUUID(), postId, userId).run();
      await this.db.prepare(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?`)
        .bind(postId).run();
      return true;
    }
  }

  async createComment(data: {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)
    `).bind(data.id, data.post_id, data.user_id, data.content).run();
    
    await this.db.prepare(`
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?
    `).bind(data.post_id).run();
  }

  async getCommentById(id: string): Promise<any | null> {
    return await this.db.prepare(`
      SELECT c.*, u.name as user_name 
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).bind(id).first();
  }

  async getPostComments(postId: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT c.*, u.name as user_name 
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).bind(postId).all();
    return result.results || [];
  }

  async createPostReport(data: {
    id: string;
    post_id: string;
    user_id: string;
    reason: string;
    description?: string;
    status: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO post_reports (id, post_id, user_id, reason, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.post_id,
      data.user_id,
      data.reason,
      data.description || null,
      data.status
    ).run();
  }

  // Event methods
  async getEvents(options: {
    brandId?: string;
    city?: string;
    type?: string;
    upcoming?: boolean;
    userId?: string;
  }): Promise<any[]> {
    let query = `
      SELECT e.*, 
             b.name as brand_name,
             b.logo_url as brand_logo_url,
             ${options.userId ? `(SELECT status FROM event_rsvps WHERE event_id = e.id AND user_id = ?) as user_rsvp_status` : 'NULL as user_rsvp_status'}
      FROM events e
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE e.published = 1
    `;
    const params: any[] = [];

    if (options.userId) {
      params.push(options.userId);
    }

    if (options.brandId) {
      query += ' AND e.brand_id = ?';
      params.push(options.brandId);
    }

    if (options.city) {
      query += ' AND e.city = ?';
      params.push(options.city);
    }

    if (options.type) {
      query += ' AND e.type = ?';
      params.push(options.type);
    }

    if (options.upcoming) {
      query += ` AND e.start_at >= datetime('now')`;
    }

    query += ' ORDER BY e.start_at ASC';

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results || [];
  }

  async getEventById(id: string, userId?: string): Promise<any | null> {
    const query = `
      SELECT e.*, 
             b.name as brand_name,
             b.logo_url as brand_logo_url,
             ${userId ? `(SELECT status FROM event_rsvps WHERE event_id = e.id AND user_id = ?) as user_rsvp_status` : 'NULL as user_rsvp_status'}
      FROM events e
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE e.id = ?
    `;
    const params = userId ? [userId, id] : [id];
    return await this.db.prepare(query).bind(...params).first();
  }

  async createOrUpdateRSVP(data: {
    event_id: string;
    user_id: string;
    status: string;
  }): Promise<void> {
    const existing = await this.db.prepare(`
      SELECT id, status FROM event_rsvps WHERE event_id = ? AND user_id = ?
    `).bind(data.event_id, data.user_id).first<{ id: string; status: string }>();

    if (existing) {
      const oldStatus = existing.status;
      
      await this.db.prepare(`
        UPDATE event_rsvps SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE event_id = ? AND user_id = ?
      `).bind(data.status, data.event_id, data.user_id).run();

      // Update RSVP count
      if (oldStatus === 'going' && data.status !== 'going') {
        await this.db.prepare(`UPDATE events SET rsvp_count = rsvp_count - 1 WHERE id = ?`)
          .bind(data.event_id).run();
      } else if (oldStatus !== 'going' && data.status === 'going') {
        await this.db.prepare(`UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = ?`)
          .bind(data.event_id).run();
      }
    } else {
      await this.db.prepare(`
        INSERT INTO event_rsvps (id, event_id, user_id, status) VALUES (?, ?, ?, ?)
      `).bind(crypto.randomUUID(), data.event_id, data.user_id, data.status).run();

      if (data.status === 'going') {
        await this.db.prepare(`UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = ?`)
          .bind(data.event_id).run();
      }
    }
  }

  async getUserRSVPs(userId: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT r.*, e.*, b.name as brand_name
      FROM event_rsvps r
      LEFT JOIN events e ON r.event_id = e.id
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE r.user_id = ?
      ORDER BY e.start_at ASC
    `).bind(userId).all();
    return result.results || [];
  }

  // Brand management methods
  async createPost(data: {
    id: string;
    brand_id: string;
    author_id?: string;
    type: string;
    title?: string;
    content: string;
    image_url?: string;
    video_url?: string;
    is_pinned: boolean;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO posts (id, brand_id, author_id, type, title, content, image_url, video_url, is_pinned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.brand_id,
      data.author_id || null,
      data.type,
      data.title || null,
      data.content,
      data.image_url || null,
      data.video_url || null,
      data.is_pinned ? 1 : 0
    ).run();
  }

  async updatePost(id: string, data: any): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(data.imageUrl);
    }
    if (data.videoUrl !== undefined) {
      updates.push('video_url = ?');
      values.push(data.videoUrl);
    }
    if (data.isPinned !== undefined) {
      updates.push('is_pinned = ?');
      values.push(data.isPinned ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await this.db.prepare(`
        UPDATE posts SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  }

  async deletePost(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  }

  async createEvent(data: {
    id: string;
    brand_id: string;
    type: string;
    title: string;
    description?: string;
    image_url?: string;
    city?: string;
    location_text?: string;
    start_at: string;
    end_at: string;
    capacity?: number;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO events (id, brand_id, type, title, description, image_url, city, location_text, start_at, end_at, capacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.brand_id,
      data.type,
      data.title,
      data.description || null,
      data.image_url || null,
      data.city || null,
      data.location_text || null,
      data.start_at,
      data.end_at,
      data.capacity || null
    ).run();
  }

  async updateEvent(id: string, data: any): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(data.imageUrl);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }
    if (data.locationText !== undefined) {
      updates.push('location_text = ?');
      values.push(data.locationText);
    }
    if (data.startAt !== undefined) {
      updates.push('start_at = ?');
      values.push(data.startAt);
    }
    if (data.endAt !== undefined) {
      updates.push('end_at = ?');
      values.push(data.endAt);
    }
    if (data.capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(data.capacity);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await this.db.prepare(`
        UPDATE events SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  }

  async deleteEvent(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
  }

  async countActivations(brandId: string): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM activations WHERE brand_id = ?')
      .bind(brandId).first<{ count: number }>();
    return result?.count || 0;
  }

  async countPosts(brandId: string): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM posts WHERE brand_id = ?')
      .bind(brandId).first<{ count: number }>();
    return result?.count || 0;
  }

  async countEvents(brandId: string): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM events WHERE brand_id = ?')
      .bind(brandId).first<{ count: number }>();
    return result?.count || 0;
  }

  async countUpcomingEvents(brandId: string): Promise<number> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count FROM events 
      WHERE brand_id = ? AND start_at >= datetime('now')
    `).bind(brandId).first<{ count: number }>();
    return result?.count || 0;
  }

  async countBrandLikes(brandId: string): Promise<number> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count FROM post_likes pl
      JOIN posts p ON pl.post_id = p.id
      WHERE p.brand_id = ?
    `).bind(brandId).first<{ count: number }>();
    return result?.count || 0;
  }

  async countBrandComments(brandId: string): Promise<number> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count FROM comments c
      JOIN posts p ON c.post_id = p.id
      WHERE p.brand_id = ?
    `).bind(brandId).first<{ count: number }>();
    return result?.count || 0;
  }

  async getAnalyticsEvents(brandId: string, days: number): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT * FROM analytics_events 
      WHERE brand_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
      ORDER BY created_at DESC
    `).bind(brandId, days).all();
    return result.results || [];
  }

  async getBrandReports(brandId: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT pr.*, p.content as post_content, u.name as reporter_name
      FROM post_reports pr
      JOIN posts p ON pr.post_id = p.id
      LEFT JOIN users u ON pr.user_id = u.id
      WHERE p.brand_id = ? AND pr.status = 'pending'
      ORDER BY pr.created_at DESC
    `).bind(brandId).all();
    return result.results || [];
  }

  async updateReportStatus(reportId: string, status: string, reviewedBy: string): Promise<void> {
    await this.db.prepare(`
      UPDATE post_reports 
      SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, reviewedBy, reportId).run();
  }

  async getBrandActivations(brandId: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activations a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.brand_id = ?
      ORDER BY a.created_at DESC
    `).bind(brandId).all();
    return result.results || [];
  }

  // Admin methods
  async getAllBrands(): Promise<Brand[]> {
    const result = await this.db.prepare('SELECT * FROM brands ORDER BY created_at DESC').all<Brand>();
    return result.results || [];
  }

  async createBrand(data: {
    id: string;
    name: string;
    slug: string;
    website_url?: string;
    logo_url?: string;
    industry?: string;
    status: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO brands (id, name, slug, website_url, logo_url, industry, status, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      data.id,
      data.name,
      data.slug,
      data.website_url || null,
      data.logo_url || null,
      data.industry || null,
      data.status
    ).run();
  }

  async updateBrand(id: string, data: any): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(data.slug);
    }
    if (data.websiteUrl !== undefined) {
      updates.push('website_url = ?');
      values.push(data.websiteUrl);
    }
    if (data.logoUrl !== undefined) {
      updates.push('logo_url = ?');
      values.push(data.logoUrl);
    }
    if (data.industry !== undefined) {
      updates.push('industry = ?');
      values.push(data.industry);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await this.db.prepare(`
        UPDATE brands SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all<User>();
    return result.results || [];
  }

  async updateUserRoleStatus(id: string, role?: string, status?: string): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await this.db.prepare(`
        UPDATE users SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  }

  async addBrandMember(data: {
    id: string;
    brand_id: string;
    user_id: string;
    role: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO brand_members (id, brand_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `).bind(data.id, data.brand_id, data.user_id, data.role).run();
  }

  async removeBrandMember(brandId: string, userId: string): Promise<void> {
    await this.db.prepare(`
      DELETE FROM brand_members WHERE brand_id = ? AND user_id = ?
    `).bind(brandId, userId).run();
  }

  async getAuditLogs(limit: number, offset: number): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    return result.results || [];
  }

  async countAllUsers(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM users')
      .first<{ count: number }>();
    return result?.count || 0;
  }

  async countAllBrands(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM brands')
      .first<{ count: number }>();
    return result?.count || 0;
  }

  async countAllActivations(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM activations')
      .first<{ count: number }>();
    return result?.count || 0;
  }

  async countAllPosts(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM posts')
      .first<{ count: number }>();
    return result?.count || 0;
  }

  async countAllEvents(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM events')
      .first<{ count: number }>();
    return result?.count || 0;
  }

  // Product methods
  async createProduct(data: {
    id: string;
    brand_id: string;
    category: string;
    name: string;
    model?: string;
    description?: string;
    price?: number;
    currency?: string;
    specifications?: any;
    features?: any;
    image_url?: string;
    gallery_urls?: string[];
    status?: string;
    stock_quantity?: number;
    year?: number;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO products (id, brand_id, category, name, model, description, price, currency, specifications, features, image_url, gallery_urls, status, stock_quantity, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.brand_id,
      data.category,
      data.name,
      data.model || null,
      data.description || null,
      data.price || null,
      data.currency || 'USD',
      data.specifications ? JSON.stringify(data.specifications) : null,
      data.features ? JSON.stringify(data.features) : null,
      data.image_url || null,
      data.gallery_urls ? JSON.stringify(data.gallery_urls) : null,
      data.status || 'active',
      data.stock_quantity || null,
      data.year || null
    ).run();
  }

  async getProducts(brandId: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT * FROM products WHERE brand_id = ? AND published = 1 ORDER BY created_at DESC
    `).bind(brandId).all();
    return result.results || [];
  }

  async getProductById(id: string): Promise<any | null> {
    const result = await this.db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (result && result.specifications) {
      try {
        result.specifications = JSON.parse(result.specifications as string);
      } catch (e) {}
    }
    if (result && result.features) {
      try {
        result.features = JSON.parse(result.features as string);
      } catch (e) {}
    }
    if (result && result.gallery_urls) {
      try {
        result.gallery_urls = JSON.parse(result.gallery_urls as string);
      } catch (e) {}
    }
    return result;
  }

  async updateProduct(id: string, data: any): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      values.push(data.model);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.price !== undefined) {
      updates.push('price = ?');
      values.push(data.price);
    }
    if (data.specifications !== undefined) {
      updates.push('specifications = ?');
      values.push(JSON.stringify(data.specifications));
    }
    if (data.features !== undefined) {
      updates.push('features = ?');
      values.push(JSON.stringify(data.features));
    }
    if (data.imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(data.imageUrl);
    }
    if (data.galleryUrls !== undefined) {
      updates.push('gallery_urls = ?');
      values.push(JSON.stringify(data.galleryUrls));
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.stockQuantity !== undefined) {
      updates.push('stock_quantity = ?');
      values.push(data.stockQuantity);
    }
    if (data.year !== undefined) {
      updates.push('year = ?');
      values.push(data.year);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await this.db.prepare(`
        UPDATE products SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  }

  // Card template methods
  async createCardTemplate(data: {
    id: string;
    brand_id: string;
    name: string;
    tier: string;
    design_config?: any;
    logo_url?: string;
    background_gradient?: string;
    text_color?: string;
    benefits?: string[];
    unlock_conditions?: any;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO card_templates (id, brand_id, name, tier, design_config, logo_url, background_gradient, text_color, benefits, unlock_conditions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.brand_id,
      data.name,
      data.tier,
      data.design_config ? JSON.stringify(data.design_config) : null,
      data.logo_url || null,
      data.background_gradient || null,
      data.text_color || null,
      data.benefits ? JSON.stringify(data.benefits) : null,
      data.unlock_conditions ? JSON.stringify(data.unlock_conditions) : null
    ).run();
  }

  async getCardTemplates(brandId: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT * FROM card_templates WHERE brand_id = ? AND is_active = 1 ORDER BY created_at DESC
    `).bind(brandId).all();
    return (result.results || []).map((t: any) => {
      if (t.design_config) {
        try {
          t.design_config = JSON.parse(t.design_config as string);
        } catch (e) {}
      }
      if (t.benefits) {
        try {
          t.benefits = JSON.parse(t.benefits as string);
        } catch (e) {}
      }
      if (t.unlock_conditions) {
        try {
          t.unlock_conditions = JSON.parse(t.unlock_conditions as string);
        } catch (e) {}
      }
      return t;
    });
  }

  async getCardTemplateById(id: string): Promise<any | null> {
    const result = await this.db.prepare('SELECT * FROM card_templates WHERE id = ?').bind(id).first();
    if (result && result.design_config) {
      try {
        result.design_config = JSON.parse(result.design_config as string);
      } catch (e) {}
    }
    if (result && result.benefits) {
      try {
        result.benefits = JSON.parse(result.benefits as string);
      } catch (e) {}
    }
    if (result && result.unlock_conditions) {
      try {
        result.unlock_conditions = JSON.parse(result.unlock_conditions as string);
      } catch (e) {}
    }
    return result;
  }

  async updateCardTemplate(id: string, data: any): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.tier !== undefined) {
      updates.push('tier = ?');
      values.push(data.tier);
    }
    if (data.designConfig !== undefined) {
      updates.push('design_config = ?');
      values.push(JSON.stringify(data.designConfig));
    }
    if (data.logoUrl !== undefined) {
      updates.push('logo_url = ?');
      values.push(data.logoUrl);
    }
    if (data.backgroundGradient !== undefined) {
      updates.push('background_gradient = ?');
      values.push(data.backgroundGradient);
    }
    if (data.textColor !== undefined) {
      updates.push('text_color = ?');
      values.push(data.textColor);
    }
    if (data.benefits !== undefined) {
      updates.push('benefits = ?');
      values.push(JSON.stringify(data.benefits));
    }
    if (data.unlockConditions !== undefined) {
      updates.push('unlock_conditions = ?');
      values.push(JSON.stringify(data.unlockConditions));
    }
    if (data.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(data.isActive ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      await this.db.prepare(`
        UPDATE card_templates SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  }

  async deleteCardTemplate(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM card_templates WHERE id = ?').bind(id).run();
  }
}
