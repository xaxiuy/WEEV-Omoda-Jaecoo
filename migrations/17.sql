
-- Knowledge Base Articles
CREATE TABLE knowledge_base_articles (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kb_brand_category ON knowledge_base_articles(brand_id, category);
CREATE INDEX idx_kb_published ON knowledge_base_articles(published);

-- Chat Threads
CREATE TABLE chat_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_user ON chat_threads(user_id);

-- Chat Messages
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_thread ON chat_messages(thread_id, created_at DESC);

-- Chat Actions (trackeable CTAs)
CREATE TABLE chat_actions (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  destination_url TEXT,
  ref_code TEXT UNIQUE,
  clicked BOOLEAN DEFAULT 0,
  clicked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_actions_thread ON chat_actions(thread_id);
CREATE INDEX idx_actions_ref ON chat_actions(ref_code);
