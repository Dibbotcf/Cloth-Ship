import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

let migrated = false;
async function ensureColumns(db) {
  if (migrated) return;
  try {
    await db.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0');
    await db.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery JSON DEFAULT NULL');
    migrated = true;
  } catch (e) {
    // Columns may already exist
    migrated = true;
  }
}

export async function GET() {
  try {
    const db = getDb();
    await ensureColumns(db);
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products. Check database connection.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = getDb();
    
    // Generate a simple slug from the name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const [result] = await db.query(
      `INSERT INTO products (slug, name, price, original_price, category, gender, fabric, occasion, colors, sizes, image, description, story, material, is_new, is_featured, stock, gallery) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, data.name, data.price, data.original_price || null, 
        data.category, data.gender, data.fabric || null, data.occasion || null,
        JSON.stringify(data.colors || []), JSON.stringify(data.sizes || []),
        data.image || '/images/products/placeholder.png', 
        data.description || null, data.story || null, data.material || null,
        data.is_new ? 1 : 0, data.is_featured ? 1 : 0,
        data.stock || 0, data.gallery ? JSON.stringify(data.gallery) : null
      ]
    );
    
    return NextResponse.json({ id: result.insertId, slug, message: 'Product created successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
