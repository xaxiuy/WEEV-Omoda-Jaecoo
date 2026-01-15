-- WEEV Platform Seed Data
-- This file contains sample data for testing and demonstration
-- Password for all demo users: Demo1234!
-- Hash generated with: bcrypt hash of "Demo1234!" with cost 10

-- Create demo brands
INSERT INTO brands (id, name, slug, logo_url, website_url, industry, status, verified_at) VALUES
  ('brand_omoda', 'Omoda Jaecoo', 'omoda-jaecoo', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', 'https://www.omodajaecoo.com.uy', 'automotive', 'verified', datetime('now')),
  ('brand_chery', 'Chery Uruguay', 'chery-uruguay', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400', 'https://www.chery.com.uy', 'automotive', 'verified', datetime('now')),
  ('brand_jetour', 'Jetour Uruguay', 'jetour-uruguay', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400', 'https://www.jetour.com.uy', 'automotive', 'verified', datetime('now'));

-- Create demo users
-- Super Admin
INSERT INTO users (id, email, password_hash, name, phone, city, role, status, email_verified) VALUES
  ('user_admin', 'admin@weev.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Platform Admin', '+598 99 100 000', 'Montevideo', 'superadmin', 'active', 1);

-- Brand Admins
INSERT INTO users (id, email, password_hash, name, phone, city, role, status, email_verified) VALUES
  ('user_omoda_admin', 'admin@omoda.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Omoda Manager', '+598 99 200 000', 'Montevideo', 'brand_admin', 'active', 1),
  ('user_chery_admin', 'admin@chery.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Chery Manager', '+598 99 300 000', 'Montevideo', 'brand_admin', 'active', 1),
  ('user_jetour_admin', 'admin@jetour.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Jetour Manager', '+598 99 400 000', 'Montevideo', 'brand_admin', 'active', 1);

-- Regular Users
INSERT INTO users (id, email, password_hash, name, phone, city, role, status, email_verified) VALUES
  ('user_001', 'juan.perez@email.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Juan Pérez', '+598 99 111 111', 'Montevideo', 'user', 'active', 1),
  ('user_002', 'maria.gonzalez@email.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'María González', '+598 99 222 222', 'Punta del Este', 'user', 'active', 1),
  ('user_003', 'carlos.rodriguez@email.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Carlos Rodríguez', '+598 99 333 333', 'Colonia', 'user', 'active', 1),
  ('user_004', 'ana.martinez@email.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Ana Martínez', '+598 99 444 444', 'Montevideo', 'user', 'active', 1),
  ('user_005', 'diego.silva@email.com', '$2b$10$rWZ8kN9vJxKHYLZQX7xYGOJ8Nw5qK3YzY0QpXzH5rM8kYJ8Nw5qK3', 'Diego Silva', '+598 99 555 555', 'Maldonado', 'user', 'active', 1);

-- Associate brand admins with their brands
INSERT INTO brand_members (id, brand_id, user_id, role) VALUES
  ('member_001', 'brand_omoda', 'user_omoda_admin', 'admin'),
  ('member_002', 'brand_chery', 'user_chery_admin', 'admin'),
  ('member_003', 'brand_jetour', 'user_jetour_admin', 'admin');

-- Create activations for regular users
INSERT INTO activations (id, user_id, brand_id, vin, license_plate, model, year, verification_method, status, verified_at) VALUES
  ('act_001', 'user_001', 'brand_omoda', 'WDB1234567890ABCD', 'SAA1234', 'Omoda 5', 2024, 'vin', 'verified', datetime('now', '-30 days')),
  ('act_002', 'user_002', 'brand_omoda', 'WDB2234567890ABCD', 'SAA2345', 'Omoda C5', 2024, 'vin', 'verified', datetime('now', '-25 days')),
  ('act_003', 'user_003', 'brand_chery', 'WDB3234567890ABCD', 'SAA3456', 'Tiggo 8 Pro', 2023, 'license_plate', 'verified', datetime('now', '-20 days')),
  ('act_004', 'user_004', 'brand_jetour', 'WDB4234567890ABCD', 'SAA4567', 'Jetour X70', 2024, 'vin', 'verified', datetime('now', '-15 days')),
  ('act_005', 'user_005', 'brand_omoda', 'WDB5234567890ABCD', 'SAA5678', 'Jaecoo 7', 2024, 'vin', 'verified', datetime('now', '-10 days'));

-- Create wallet cards for activated users
INSERT INTO wallet_cards (id, user_id, brand_id, member_id, tier) VALUES
  ('card_001', 'user_001', 'brand_omoda', 'OMD-2024-001', 'gold'),
  ('card_002', 'user_002', 'brand_omoda', 'OMD-2024-002', 'silver'),
  ('card_003', 'user_003', 'brand_chery', 'CHY-2023-101', 'gold'),
  ('card_004', 'user_004', 'brand_jetour', 'JTR-2024-001', 'silver'),
  ('card_005', 'user_005', 'brand_omoda', 'OMD-2024-003', 'platinum');

-- Create wallet updates
INSERT INTO wallet_updates (id, user_id, brand_id, type, title, description, action_url, is_read) VALUES
  ('upd_001', 'user_001', 'brand_omoda', 'benefit', 'Welcome Benefit', 'Get 20% off your first maintenance service', '/wallet', 0),
  ('upd_002', 'user_001', 'brand_omoda', 'event', 'New Event Available', 'Service clinic next Saturday in Montevideo', '/events', 1),
  ('upd_003', 'user_002', 'brand_omoda', 'promotion', 'Exclusive Offer', 'Free oil change for Gold members', '/wallet', 0),
  ('upd_004', 'user_003', 'brand_chery', 'benefit', 'Tier Upgrade', 'Congratulations! You have been upgraded to Gold tier', '/wallet', 0),
  ('upd_005', 'user_004', 'brand_jetour', 'announcement', 'New Features', 'Check out the latest updates in the app', '/feed', 1),
  ('upd_006', 'user_005', 'brand_omoda', 'benefit', 'Platinum Perks', 'Access to exclusive test drive events', '/events', 0);

-- Create posts
INSERT INTO posts (id, brand_id, author_id, type, title, content, image_url, is_pinned) VALUES
  ('post_001', 'brand_omoda', 'user_omoda_admin', 'announcement', 'Welcome to WEEV!', 'We are excited to have you join our community. Discover exclusive benefits, events, and connect with fellow owners.', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', 1),
  ('post_002', 'brand_omoda', 'user_omoda_admin', 'news', 'New Omoda 5 Features', 'Check out the latest technology updates in the 2024 Omoda 5 model. Advanced safety features and enhanced connectivity.', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 0),
  ('post_003', 'brand_chery', 'user_chery_admin', 'announcement', 'Service Campaign', 'Free winter check-up for all Tiggo owners. Book your appointment now!', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800', 1),
  ('post_004', 'brand_jetour', 'user_jetour_admin', 'community', 'Member Spotlight', 'Meet Diego Silva and his adventure-ready Jetour X70. Read his story about exploring Uruguay.', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800', 0),
  ('post_005', 'brand_omoda', 'user_omoda_admin', 'promotion', 'Summer Sale', 'Exclusive accessories at 30% off for WEEV members. Limited time offer!', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 0);

-- Create post likes
INSERT INTO post_likes (id, post_id, user_id) VALUES
  ('like_001', 'post_001', 'user_001'),
  ('like_002', 'post_001', 'user_002'),
  ('like_003', 'post_001', 'user_003'),
  ('like_004', 'post_002', 'user_001'),
  ('like_005', 'post_002', 'user_005'),
  ('like_006', 'post_003', 'user_003'),
  ('like_007', 'post_004', 'user_004'),
  ('like_008', 'post_004', 'user_005'),
  ('like_009', 'post_005', 'user_001'),
  ('like_010', 'post_005', 'user_002');

-- Create comments
INSERT INTO comments (id, post_id, user_id, content) VALUES
  ('comment_001', 'post_001', 'user_001', 'Excited to be part of this community!'),
  ('comment_002', 'post_001', 'user_002', 'Love the benefits already!'),
  ('comment_003', 'post_002', 'user_001', 'The new safety features are amazing'),
  ('comment_004', 'post_003', 'user_003', 'Just booked my appointment!'),
  ('comment_005', 'post_004', 'user_004', 'Thank you for the spotlight!'),
  ('comment_006', 'post_005', 'user_002', 'Great deal! Just ordered accessories');

-- Create events
INSERT INTO events (id, brand_id, type, title, description, image_url, city, location_text, start_at, end_at, capacity) VALUES
  ('event_001', 'brand_omoda', 'service_clinic', 'Winter Service Clinic - Montevideo', 'Free winter vehicle check-up and maintenance tips from our expert technicians. Complimentary refreshments.', 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800', 'Montevideo', 'Omoda Showroom, Av. Italia 2050', datetime('now', '+7 days', '10:00'), datetime('now', '+7 days', '13:00'), 50),
  ('event_002', 'brand_omoda', 'test_drive', 'Test Drive Weekend - Punta del Este', 'Experience the Omoda 5 and Jaecoo 7 with exclusive coastal test drives. Limited slots available.', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'Punta del Este', 'Playa Brava Beach Parking', datetime('now', '+14 days', '09:00'), datetime('now', '+14 days', '18:00'), 30),
  ('event_003', 'brand_chery', 'meetup', 'Chery Owners Meetup - Colonia', 'Monthly gathering of Chery owners. Share experiences, tips, and enjoy a BBQ by the river.', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'Colonia', 'Parque Ferrando', datetime('now', '+21 days', '11:00'), datetime('now', '+21 days', '16:00'), 100),
  ('event_004', 'brand_jetour', 'event', 'Adventure Rally - Maldonado', 'Off-road adventure experience with Jetour X70. Professional guides and safety equipment included.', 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=800', 'Maldonado', 'Sierra de las Ánimas', datetime('now', '+30 days', '08:00'), datetime('now', '+30 days', '17:00'), 20),
  ('event_005', 'brand_omoda', 'service_clinic', 'Summer Ready Clinic - Montevideo', 'Prepare your vehicle for summer road trips. AC service, tire check, and travel safety kit included.', 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800', 'Montevideo', 'Omoda Service Center, Ruta 1 Km 18', datetime('now', '+45 days', '10:00'), datetime('now', '+45 days', '14:00'), 40);

-- Create event RSVPs
INSERT INTO event_rsvps (id, event_id, user_id, status) VALUES
  ('rsvp_001', 'event_001', 'user_001', 'going'),
  ('rsvp_002', 'event_001', 'user_002', 'going'),
  ('rsvp_003', 'event_001', 'user_005', 'interested'),
  ('rsvp_004', 'event_002', 'user_001', 'going'),
  ('rsvp_005', 'event_002', 'user_002', 'going'),
  ('rsvp_006', 'event_003', 'user_003', 'going'),
  ('rsvp_007', 'event_004', 'user_004', 'going'),
  ('rsvp_008', 'event_005', 'user_001', 'interested'),
  ('rsvp_009', 'event_005', 'user_005', 'going');

-- Create analytics events
INSERT INTO analytics_events (id, brand_id, user_id, event_type, metadata) VALUES
  ('analytics_001', 'brand_omoda', 'user_001', 'page_view', '{"page": "feed"}'),
  ('analytics_002', 'brand_omoda', 'user_001', 'post_like', '{"post_id": "post_001"}'),
  ('analytics_003', 'brand_omoda', 'user_002', 'event_rsvp', '{"event_id": "event_001", "status": "going"}'),
  ('analytics_004', 'brand_chery', 'user_003', 'page_view', '{"page": "wallet"}'),
  ('analytics_005', 'brand_jetour', 'user_004', 'page_view', '{"page": "events"}'),
  ('analytics_006', 'brand_omoda', 'user_005', 'post_like', '{"post_id": "post_002"}'),
  ('analytics_007', 'brand_omoda', 'user_001', 'comment', '{"post_id": "post_001"}'),
  ('analytics_008', 'brand_chery', 'user_003', 'event_rsvp', '{"event_id": "event_003", "status": "going"}');

-- Create audit logs
INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, metadata) VALUES
  ('audit_001', 'user_admin', 'create', 'brand', 'brand_omoda', '{"name": "Omoda Jaecoo"}'),
  ('audit_002', 'user_admin', 'create', 'brand', 'brand_chery', '{"name": "Chery Uruguay"}'),
  ('audit_003', 'user_admin', 'create', 'brand', 'brand_jetour', '{"name": "Jetour Uruguay"}'),
  ('audit_004', 'user_omoda_admin', 'create', 'post', 'post_001', '{"title": "Welcome to WEEV!"}'),
  ('audit_005', 'user_omoda_admin', 'create', 'event', 'event_001', '{"title": "Winter Service Clinic"}');

-- Verification: Display counts
SELECT 'Brands' as table_name, COUNT(*) as count FROM brands
UNION ALL SELECT 'Users', COUNT(*) FROM users
UNION ALL SELECT 'Brand Members', COUNT(*) FROM brand_members
UNION ALL SELECT 'Activations', COUNT(*) FROM activations
UNION ALL SELECT 'Wallet Cards', COUNT(*) FROM wallet_cards
UNION ALL SELECT 'Wallet Updates', COUNT(*) FROM wallet_updates
UNION ALL SELECT 'Posts', COUNT(*) FROM posts
UNION ALL SELECT 'Post Likes', COUNT(*) FROM post_likes
UNION ALL SELECT 'Comments', COUNT(*) FROM comments
UNION ALL SELECT 'Events', COUNT(*) FROM events
UNION ALL SELECT 'Event RSVPs', COUNT(*) FROM event_rsvps
UNION ALL SELECT 'Analytics Events', COUNT(*) FROM analytics_events
UNION ALL SELECT 'Audit Logs', COUNT(*) FROM audit_logs;
