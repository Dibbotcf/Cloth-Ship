import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await request.json();
    const db = getDb();
    
    if (!data.slug || !data.name) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    try {
      const [oldRows] = await db.query('SELECT slug FROM categories WHERE id = ?', [id]);
      const oldSlug = oldRows.length > 0 ? oldRows[0].slug : null;

      await db.query(
        'UPDATE categories SET slug = ?, name = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
        [data.slug, data.name, id]
      );

      if (oldSlug && oldSlug !== data.slug) {
        await db.query('UPDATE products SET category = ? WHERE category = ?', [data.slug, oldSlug]);
      }

      return NextResponse.json({ message: 'Category updated successfully' });
    } catch (dbError) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDb();
    
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
