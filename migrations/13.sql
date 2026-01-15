
-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  city TEXT,
  location_text TEXT,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  capacity INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_brand_id ON events(brand_id);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_city ON events(city);
