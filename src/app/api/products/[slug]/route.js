import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { slug } = params;
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
