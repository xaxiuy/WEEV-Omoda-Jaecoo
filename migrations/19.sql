
CREATE TABLE card_templates (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  design_config TEXT,
  logo_url TEXT,
  background_gradient TEXT,
  text_color TEXT,
  benefits TEXT,
  unlock_conditions TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_card_templates_brand ON card_templates(brand_id);
CREATE INDEX idx_card_templates_tier ON card_templates(tier);
