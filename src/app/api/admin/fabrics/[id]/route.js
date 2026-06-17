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
      const [oldRows] = await db.query('SELECT name FROM fabrics WHERE id = ?', [id]);
      const oldName = oldRows.length > 0 ? oldRows[0].name : null;

      await db.query(
        'UPDATE fabrics SET slug = ?, name = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
        [data.slug, data.name, id]
      );

      if (oldName && oldName !== data.name) {
        await db.query('UPDATE products SET fabric = ? WHERE fabric = ?', [data.name, oldName]);
      }

      return NextResponse.json({ message: 'Fabric updated successfully' });
    } catch (dbError) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Fabric with this slug already exists' }, { status: 400 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update fabric' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDb();
    
    await db.query('DELETE FROM fabrics WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Fabric deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete fabric' }, { status: 500 });
  }
}
