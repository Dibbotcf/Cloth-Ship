import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
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
      `INSERT INTO products (slug, name, price, original_price, category, gender, fabric, occasion, colors, sizes, image, description, is_new, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, data.name, data.price, data.original_price || null, 
        data.category, data.gender, data.fabric, data.occasion,
        JSON.stringify(data.colors || []), JSON.stringify(data.sizes || []),
        data.image || '/images/products/placeholder.png', 
        data.description, data.is_new ? 1 : 0, data.is_featured ? 1 : 0
      ]
    );
    
    return NextResponse.json({ id: result.insertId, slug, message: 'Product created successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
