import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const { entry_date, amount, note } = await request.json();
    if (!amount || parseFloat(amount) === 0) {
      return NextResponse.json({ error: 'Amount cannot be zero' }, { status: 400 });
    }
    const db = getDb();
    const [rows] = await db.query('SELECT id FROM ledger_capital WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Capital entry not found' }, { status: 404 });
    }
    await db.query(
      'UPDATE ledger_capital SET entry_date = ?, amount = ?, note = ? WHERE id = ?',
      [entry_date, parseFloat(amount), note || null, id]
    );
    return NextResponse.json({ message: 'Capital entry updated' });
  } catch (error) {
    console.error('Capital PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update capital entry' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const [rows] = await db.query('SELECT id FROM ledger_capital WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Capital entry not found' }, { status: 404 });
    }
    await db.query('DELETE FROM ledger_capital WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Capital entry deleted' });
  } catch (error) {
    console.error('Capital DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete capital entry' }, { status: 500 });
  }
}
