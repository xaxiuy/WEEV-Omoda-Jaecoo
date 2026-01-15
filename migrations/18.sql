
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  model TEXT,
  description TEXT,
  price REAL,
  currency TEXT DEFAULT 'USD',
  specifications TEXT,
  features TEXT,
  image_url TEXT,
  gallery_urls TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  stock_quantity INTEGER,
  year INTEGER,
  published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
