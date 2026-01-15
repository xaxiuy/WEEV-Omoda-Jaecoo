
-- Wallet updates table
CREATE TABLE wallet_updates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_updates_user_id ON wallet_updates(user_id);
CREATE INDEX idx_wallet_updates_brand_id ON wallet_updates(brand_id);
CREATE INDEX idx_wallet_updates_is_read ON wallet_updates(is_read);
