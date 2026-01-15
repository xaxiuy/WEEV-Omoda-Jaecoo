
-- Posts table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  author_id TEXT,
  type TEXT NOT NULL DEFAULT 'post',
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  is_pinned BOOLEAN DEFAULT 0,
  published BOOLEAN DEFAULT 1,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_brand_id ON posts(brand_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned);
