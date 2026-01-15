
-- Analytics events
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  brand_id TEXT,
  event_type TEXT NOT NULL,
  event_data TEXT,
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_brand_id ON analytics_events(brand_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
