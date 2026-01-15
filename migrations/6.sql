
-- Wallet cards
CREATE TABLE wallet_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  brand_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'member',
  activation_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_cards_user_id ON wallet_cards(user_id);
CREATE INDEX idx_wallet_cards_brand_id ON wallet_cards(brand_id);
