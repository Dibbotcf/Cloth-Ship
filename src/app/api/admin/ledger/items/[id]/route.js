import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const { name, category, unit } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }
    const db = getDb();
    const [rows] = await db.query('SELECT id FROM ledger_items WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    await db.query(
      'UPDATE ledger_items SET name = ?, category = ?, unit = ? WHERE id = ?',
      [name.trim(), category || null, unit || 'piece', id]
    );
    return NextResponse.json({ message: 'Item updated' });
  } catch (error) {
    console.error('Ledger Item PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const [rows] = await db.query('SELECT id FROM ledger_items WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    // Check if item has purchases or sales
    const [[{ cnt }]] = await db.query(
      'SELECT (SELECT COUNT(*) FROM ledger_purchases WHERE item_id = ?) + (SELECT COUNT(*) FROM ledger_sales WHERE item_id = ?) AS cnt',
      [id, id]
    );
    if (cnt > 0) {
      return NextResponse.json({ error: 'Cannot delete item with existing purchases or sales. Delete those records first.' }, { status: 400 });
    }
    await db.query('DELETE FROM ledger_items WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Ledger Item DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
