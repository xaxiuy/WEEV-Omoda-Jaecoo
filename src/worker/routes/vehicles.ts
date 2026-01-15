import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types';

type AuthEnv = { Bindings: Env; Variables: { userId: string; role: string; brandId?: string } };

const vehicleRoutes = new Hono<AuthEnv>();

// Apply auth middleware to all routes
vehicleRoutes.use('/*', authMiddleware);

// Validation schemas
const createModelSchema = z.object({
  name: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  category: z.string().optional(),
  bodyType: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  horsepower: z.number().int().optional(),
  torque: z.number().int().optional(),
  seats: z.number().int().optional(),
  doors: z.number().int().optional(),
  driveType: z.string().optional(),
  imageUrl: z.string().url().optional(),
  galleryUrls: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  msrp: z.number().optional(),
  currency: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
});

const updateModelSchema = createModelSchema.partial();

const createInventorySchema = z.object({
  modelId: z.string().min(1),
  vin: z.string().min(17).max(17),
  licensePlate: z.string().optional(),
  color: z.string().optional(),
  productionDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  status: z.enum(['available', 'sold', 'reserved', 'in_transit']).default('available'),
  location: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  condition: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

const updateInventorySchema = createInventorySchema.partial().omit({ modelId: true });

const bulkInventorySchema = z.object({
  modelId: z.string().min(1),
  vehicles: z.array(
    z.object({
      vin: z.string().min(17).max(17),
      licensePlate: z.string().optional(),
      color: z.string().optional(),
      productionDate: z.string().optional(),
      deliveryDate: z.string().optional(),
      status: z.enum(['available', 'sold', 'reserved', 'in_transit']).optional(),
      location: z.string().optional(),
      mileage: z.number().int().min(0).optional(),
      condition: z.string().optional(),
      price: z.number().optional(),
      currency: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
});

// Get user's brand ID helper
async function getUserBrandId(c: any): Promise<string | null> {
  const userId = c.get('userId') as string;
  const role = c.get('role') as string;
  
  // SuperAdmin can see all models - but we'll filter by brand_id in query param if provided
  if (role === 'superadmin') {
    const brandId = c.req.query('brandId');
    return brandId || null;
  }
  
  // Get user's brand membership
  const member = await c.env.DB
    .prepare('SELECT brand_id FROM brand_members WHERE user_id = ? LIMIT 1')
    .bind(userId)
    .first();
  
  return (member as any)?.brand_id || null;
}

// List all vehicle models
vehicleRoutes.get('/models', async (c) => {
  const db = c.env.DB;
  const brandId = await getUserBrandId(c);
  
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }
  
  const models = await db
    .prepare(
      `SELECT 
        id,
        name,
        year,
        category,
        body_type,
        engine,
        transmission,
        fuel_type,
        horsepower,
        torque,
        seats,
        doors,
        drive_type,
        image_url,
        gallery_urls,
        specifications,
        features,
        msrp,
        currency,
        status,
        created_at,
        updated_at
      FROM vehicle_models
      WHERE brand_id = ?
      ORDER BY year DESC, name ASC`
    )
    .bind(brandId)
    .all();

  return c.json({
    models: models.results.map((model: any) => ({
      ...model,
      gallery_urls: model.gallery_urls ? JSON.parse(model.gallery_urls) : [],
      specifications: model.specifications ? JSON.parse(model.specifications) : {},
      features: model.features ? JSON.parse(model.features) : [],
    })),
  });
});

// Create vehicle model
vehicleRoutes.post('/models', async (c) => {
  const body = await c.req.json();
  const data = createModelSchema.parse(body);
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO vehicle_models (
        id, brand_id, name, year, category, body_type, engine, transmission,
        fuel_type, horsepower, torque, seats, doors, drive_type,
        image_url, gallery_urls, specifications, features,
        msrp, currency, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      brandId,
      data.name,
      data.year,
      data.category || null,
      data.bodyType || null,
      data.engine || null,
      data.transmission || null,
      data.fuelType || null,
      data.horsepower || null,
      data.torque || null,
      data.seats || null,
      data.doors || null,
      data.driveType || null,
      data.imageUrl || null,
      data.galleryUrls ? JSON.stringify(data.galleryUrls) : null,
      data.specifications ? JSON.stringify(data.specifications) : null,
      data.features ? JSON.stringify(data.features) : null,
      data.msrp || null,
      data.currency || 'USD',
      data.status,
      now,
      now
    )
    .run();

  return c.json({ id, message: 'Model created successfully' }, 201);
});

// Update vehicle model
vehicleRoutes.patch('/models/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateModelSchema.parse(body);
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }
  
  // Verify model belongs to brand
  const model = await db.prepare('SELECT brand_id FROM vehicle_models WHERE id = ?').bind(id).first();
  if (!model || (model as any).brand_id !== brandId) {
    return c.json({ error: 'Model not found' }, 404);
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.year !== undefined) {
    updates.push('year = ?');
    values.push(data.year);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category || null);
  }
  if (data.bodyType !== undefined) {
    updates.push('body_type = ?');
    values.push(data.bodyType || null);
  }
  if (data.engine !== undefined) {
    updates.push('engine = ?');
    values.push(data.engine || null);
  }
  if (data.transmission !== undefined) {
    updates.push('transmission = ?');
    values.push(data.transmission || null);
  }
  if (data.fuelType !== undefined) {
    updates.push('fuel_type = ?');
    values.push(data.fuelType || null);
  }
  if (data.horsepower !== undefined) {
    updates.push('horsepower = ?');
    values.push(data.horsepower || null);
  }
  if (data.torque !== undefined) {
    updates.push('torque = ?');
    values.push(data.torque || null);
  }
  if (data.seats !== undefined) {
    updates.push('seats = ?');
    values.push(data.seats || null);
  }
  if (data.doors !== undefined) {
    updates.push('doors = ?');
    values.push(data.doors || null);
  }
  if (data.driveType !== undefined) {
    updates.push('drive_type = ?');
    values.push(data.driveType || null);
  }
  if (data.imageUrl !== undefined) {
    updates.push('image_url = ?');
    values.push(data.imageUrl || null);
  }
  if (data.galleryUrls !== undefined) {
    updates.push('gallery_urls = ?');
    values.push(data.galleryUrls ? JSON.stringify(data.galleryUrls) : null);
  }
  if (data.specifications !== undefined) {
    updates.push('specifications = ?');
    values.push(data.specifications ? JSON.stringify(data.specifications) : null);
  }
  if (data.features !== undefined) {
    updates.push('features = ?');
    values.push(data.features ? JSON.stringify(data.features) : null);
  }
  if (data.msrp !== undefined) {
    updates.push('msrp = ?');
    values.push(data.msrp || null);
  }
  if (data.currency !== undefined) {
    updates.push('currency = ?');
    values.push(data.currency);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }

  if (updates.length === 0) {
    return c.json({ message: 'No fields to update' }, 400);
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await db
    .prepare(`UPDATE vehicle_models SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return c.json({ message: 'Model updated successfully' });
});

// Delete vehicle model
vehicleRoutes.delete('/models/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }
  
  // Verify model belongs to brand
  const model = await db.prepare('SELECT brand_id FROM vehicle_models WHERE id = ?').bind(id).first();
  if (!model || (model as any).brand_id !== brandId) {
    return c.json({ error: 'Model not found' }, 404);
  }

  // Check if there are any vehicles with this model
  const count = await db
    .prepare('SELECT COUNT(*) as count FROM vehicle_inventory WHERE model_id = ?')
    .bind(id)
    .first();

  if (count && (count as any).count > 0) {
    return c.json({ error: 'Cannot delete model with existing vehicles in inventory' }, 400);
  }

  await db.prepare('DELETE FROM vehicle_models WHERE id = ?').bind(id).run();

  return c.json({ message: 'Model deleted successfully' });
});

// List all inventory
vehicleRoutes.get('/inventory', async (c) => {
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }

  const inventory = await db
    .prepare(
      `SELECT 
        vi.id,
        vi.model_id,
        vm.name as model_name,
        vm.year as model_year,
        vi.vin,
        vi.license_plate,
        vi.color,
        vi.production_date,
        vi.delivery_date,
        vi.status,
        vi.location,
        vi.mileage,
        vi.condition,
        vi.price,
        vi.currency,
        vi.notes,
        vi.created_at,
        vi.updated_at
      FROM vehicle_inventory vi
      LEFT JOIN vehicle_models vm ON vi.model_id = vm.id
      WHERE vi.brand_id = ?
      ORDER BY vi.created_at DESC`
    )
    .bind(brandId)
    .all();

  return c.json({ inventory: inventory.results });
});

// Create inventory item
vehicleRoutes.post('/inventory', async (c) => {
  const body = await c.req.json();
  const data = createInventorySchema.parse(body);
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }

  // Check if VIN already exists
  const existing = await db
    .prepare('SELECT id FROM vehicle_inventory WHERE vin = ?')
    .bind(data.vin)
    .first();

  if (existing) {
    return c.json({ error: 'VIN already exists in inventory' }, 400);
  }

  // Verify model exists and belongs to brand
  const model = await db
    .prepare('SELECT id FROM vehicle_models WHERE id = ? AND brand_id = ?')
    .bind(data.modelId, brandId)
    .first();

  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO vehicle_inventory (
        id, brand_id, model_id, vin, license_plate, color, production_date,
        delivery_date, status, location, mileage, condition,
        price, currency, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      brandId,
      data.modelId,
      data.vin,
      data.licensePlate || null,
      data.color || null,
      data.productionDate || null,
      data.deliveryDate || null,
      data.status,
      data.location || null,
      data.mileage || 0,
      data.condition || null,
      data.price || null,
      data.currency || 'USD',
      data.notes || null,
      now,
      now
    )
    .run();

  return c.json({ id, message: 'Vehicle added to inventory' }, 201);
});

// Bulk create inventory
vehicleRoutes.post('/inventory/bulk', async (c) => {
  const body = await c.req.json();
  const data = bulkInventorySchema.parse(body);
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }

  // Verify model exists and belongs to brand
  const model = await db
    .prepare('SELECT id FROM vehicle_models WHERE id = ? AND brand_id = ?')
    .bind(data.modelId, brandId)
    .first();

  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }

  let successCount = 0;
  let failedCount = 0;
  const now = new Date().toISOString();

  for (const vehicle of data.vehicles) {
    try {
      // Check if VIN already exists
      const existing = await db
        .prepare('SELECT id FROM vehicle_inventory WHERE vin = ?')
        .bind(vehicle.vin)
        .first();

      if (existing) {
        failedCount++;
        continue;
      }

      const id = crypto.randomUUID();

      await db
        .prepare(
          `INSERT INTO vehicle_inventory (
            id, brand_id, model_id, vin, license_plate, color, production_date,
            delivery_date, status, location, mileage, condition,
            price, currency, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          id,
          brandId,
          data.modelId,
          vehicle.vin,
          vehicle.licensePlate || null,
          vehicle.color || null,
          vehicle.productionDate || null,
          vehicle.deliveryDate || null,
          vehicle.status || 'available',
          vehicle.location || null,
          vehicle.mileage || 0,
          vehicle.condition || null,
          vehicle.price || null,
          vehicle.currency || 'USD',
          vehicle.notes || null,
          now,
          now
        )
        .run();

      successCount++;
    } catch (error) {
      console.error('Failed to insert vehicle:', error);
      failedCount++;
    }
  }

  return c.json({
    message: 'Bulk upload completed',
    success: successCount,
    failed: failedCount,
  });
});

// Update inventory item
vehicleRoutes.patch('/inventory/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = updateInventorySchema.parse(body);
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }
  
  // Verify vehicle belongs to brand
  const vehicle = await db.prepare('SELECT brand_id FROM vehicle_inventory WHERE id = ?').bind(id).first();
  if (!vehicle || (vehicle as any).brand_id !== brandId) {
    return c.json({ error: 'Vehicle not found' }, 404);
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (data.vin !== undefined) {
    // Check if VIN is being changed to one that already exists
    const existing = await db
      .prepare('SELECT id FROM vehicle_inventory WHERE vin = ? AND id != ?')
      .bind(data.vin, id)
      .first();

    if (existing) {
      return c.json({ error: 'VIN already exists in inventory' }, 400);
    }

    updates.push('vin = ?');
    values.push(data.vin);
  }
  if (data.licensePlate !== undefined) {
    updates.push('license_plate = ?');
    values.push(data.licensePlate || null);
  }
  if (data.color !== undefined) {
    updates.push('color = ?');
    values.push(data.color || null);
  }
  if (data.productionDate !== undefined) {
    updates.push('production_date = ?');
    values.push(data.productionDate || null);
  }
  if (data.deliveryDate !== undefined) {
    updates.push('delivery_date = ?');
    values.push(data.deliveryDate || null);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.location !== undefined) {
    updates.push('location = ?');
    values.push(data.location || null);
  }
  if (data.mileage !== undefined) {
    updates.push('mileage = ?');
    values.push(data.mileage);
  }
  if (data.condition !== undefined) {
    updates.push('condition = ?');
    values.push(data.condition || null);
  }
  if (data.price !== undefined) {
    updates.push('price = ?');
    values.push(data.price || null);
  }
  if (data.currency !== undefined) {
    updates.push('currency = ?');
    values.push(data.currency);
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    values.push(data.notes || null);
  }

  if (updates.length === 0) {
    return c.json({ message: 'No fields to update' }, 400);
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await db
    .prepare(`UPDATE vehicle_inventory SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return c.json({ message: 'Vehicle updated successfully' });
});

// Delete inventory item
vehicleRoutes.delete('/inventory/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  
  const brandId = await getUserBrandId(c);
  if (!brandId) {
    return c.json({ error: 'Brand access required' }, 403);
  }
  
  // Verify vehicle belongs to brand
  const vehicle = await db.prepare('SELECT brand_id FROM vehicle_inventory WHERE id = ?').bind(id).first();
  if (!vehicle || (vehicle as any).brand_id !== brandId) {
    return c.json({ error: 'Vehicle not found' }, 404);
  }

  await db.prepare('DELETE FROM vehicle_inventory WHERE id = ?').bind(id).run();

  return c.json({ message: 'Vehicle removed from inventory' });
});

export { vehicleRoutes };
