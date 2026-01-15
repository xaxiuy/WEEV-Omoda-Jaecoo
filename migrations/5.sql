
-- Activations (vehicle activation)
CREATE TABLE activations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  vin TEXT,
  license_plate TEXT,
  model TEXT,
  year INTEGER,
  verification_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at DATETIME,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activations_user_id ON activations(user_id);
CREATE INDEX idx_activations_brand_id ON activations(brand_id);
CREATE INDEX idx_activations_vin ON activations(vin);
CREATE INDEX idx_activations_status ON activations(status);
