import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const [rows] = await db.query('SELECT id FROM ledger_sales WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }
    await db.query('DELETE FROM ledger_sales WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Sale deleted' });
  } catch (error) {
    console.error('Sale DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}
