
-- Insert example vehicle model for the first brand in the database
INSERT INTO vehicle_models (
  id, brand_id, name, year, category, body_type, engine, transmission,
  fuel_type, horsepower, torque, seats, doors, drive_type,
  image_url, gallery_urls, specifications, features,
  msrp, currency, status, created_at, updated_at
)
SELECT
  'example-model-001',
  (SELECT id FROM brands ORDER BY created_at ASC LIMIT 1),
  'Luxury SUV Premium',
  2024,
  'SUV',
  '5-door SUV',
  '3.0L V6 Twin-Turbo',
  'Automática 8 velocidades',
  'Nafta Premium',
  400,
  550,
  7,
  5,
  'AWD',
  'https://019bbd58-8b63-7511-b38d-98b379e12b89.mochausercontent.com/example-suv.png',
  '[]',
  '{"Aceleración 0-100 km/h": "5.2 segundos", "Velocidad máxima": "250 km/h", "Consumo urbano": "12.5 L/100km", "Consumo carretera": "8.5 L/100km", "Capacidad tanque": "80 litros", "Maletero": "750 litros"}',
  '["Control de crucero adaptativo", "Sistema de navegación premium", "Techo panorámico", "Asientos de cuero ventilados", "Sistema de sonido premium 15 altavoces", "Cámara 360 grados", "Asistente de estacionamiento automático", "Frenos de cerámica"]',
  85000,
  'USD',
  'active',
  datetime('now'),
  datetime('now')
WHERE (SELECT COUNT(*) FROM brands) > 0;

-- Insert example vehicle in inventory
INSERT INTO vehicle_inventory (
  id, brand_id, model_id, vin, license_plate, color, production_date,
  delivery_date, status, location, mileage, condition,
  price, currency, notes, created_at, updated_at
)
SELECT
  'example-vehicle-001',
  (SELECT id FROM brands ORDER BY created_at ASC LIMIT 1),
  'example-model-001',
  'WBA12345678901234',
  'ABC123',
  'Plata Metálico',
  '2024-01-15',
  '2024-02-10',
  'available',
  'Buenos Aires - Showroom Central',
  0,
  'Nuevo',
  87500,
  'USD',
  'Vehículo de demostración con equipamiento completo y garantía extendida de 5 años',
  datetime('now'),
  datetime('now')
WHERE (SELECT COUNT(*) FROM brands) > 0 AND EXISTS (SELECT 1 FROM vehicle_models WHERE id = 'example-model-001');
