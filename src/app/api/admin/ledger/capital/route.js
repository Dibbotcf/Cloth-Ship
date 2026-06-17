import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all capital entries + running total
export async function GET() {
  try {
    const db = getDb();
    const [rows] = await db.query(
      'SELECT * FROM ledger_capital ORDER BY entry_date DESC, created_at DESC'
    );
    const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);
    return NextResponse.json({ entries: rows, total });
  } catch (error) {
    console.error('Capital GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch capital entries' }, { status: 500 });
  }
}

// POST add a capital injection or withdrawal
export async function POST(request) {
  try {
    const { entry_date, amount, note } = await request.json();
    if (!entry_date || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'entry_date and amount are required' }, { status: 400 });
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt === 0) {
      return NextResponse.json({ error: 'amount must be a non-zero number' }, { status: 400 });
    }
    const db = getDb();
    const [result] = await db.query(
      'INSERT INTO ledger_capital (entry_date, amount, note) VALUES (?, ?, ?)',
      [entry_date, amt, note || null]
    );
    return NextResponse.json({ id: result.insertId, message: 'Capital entry added' }, { status: 201 });
  } catch (error) {
    console.error('Capital POST Error:', error);
    return NextResponse.json({ error: 'Failed to add capital entry' }, { status: 500 });
  }
}
