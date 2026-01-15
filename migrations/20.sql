
CREATE TABLE vehicle_models (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT,
  body_type TEXT,
  engine TEXT,
  transmission TEXT,
  fuel_type TEXT,
  horsepower INTEGER,
  torque INTEGER,
  seats INTEGER,
  doors INTEGER,
  drive_type TEXT,
  image_url TEXT,
  gallery_urls TEXT,
  specifications TEXT,
  features TEXT,
  msrp REAL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_models_brand_id ON vehicle_models(brand_id);
CREATE INDEX idx_vehicle_models_year ON vehicle_models(year);

CREATE TABLE vehicle_inventory (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  vin TEXT NOT NULL UNIQUE,
  license_plate TEXT,
  color TEXT,
  production_date DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'available',
  location TEXT,
  mileage INTEGER DEFAULT 0,
  condition TEXT,
  price REAL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_inventory_brand_id ON vehicle_inventory(brand_id);
CREATE INDEX idx_vehicle_inventory_model_id ON vehicle_inventory(model_id);
CREATE INDEX idx_vehicle_inventory_vin ON vehicle_inventory(vin);
CREATE INDEX idx_vehicle_inventory_status ON vehicle_inventory(status);
