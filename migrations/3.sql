
-- Brand members (RBAC)
CREATE TABLE brand_members (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand_id, user_id)
);

CREATE INDEX idx_brand_members_brand_id ON brand_members(brand_id);
CREATE INDEX idx_brand_members_user_id ON brand_members(user_id);
