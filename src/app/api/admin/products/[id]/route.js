import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await request.json();
    const db = getDb();
    
    // Update slug if name changes
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await db.query(
      `UPDATE products 
       SET slug=?, name=?, price=?, original_price=?, category=?, gender=?, fabric=?, occasion=?, colors=?, sizes=?, image=?, description=?, is_new=?, is_featured=?
       WHERE id=?`,
      [
        slug, data.name, data.price, data.original_price || null, 
        data.category, data.gender, data.fabric, data.occasion,
        JSON.stringify(data.colors || []), JSON.stringify(data.sizes || []),
        data.image, data.description, data.is_new ? 1 : 0, data.is_featured ? 1 : 0,
        id
      ]
    );
    
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDb();
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
