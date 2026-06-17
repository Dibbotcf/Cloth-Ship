import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all purchases with item name
export async function GET() {
  try {
    const db = getDb();
    const [rows] = await db.query(`
      SELECT p.*, i.name AS item_name, i.unit AS item_unit
      FROM ledger_purchases p
      JOIN ledger_items i ON i.id = p.item_id
      ORDER BY p.purchase_date DESC, p.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Purchases GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

// POST record a purchase — always compute total_cost server-side
export async function POST(request) {
  try {
    const { item_id, purchase_date, supplier, quantity, unit_cost, note } = await request.json();

    if (!item_id || !purchase_date || !quantity || !unit_cost) {
      return NextResponse.json({ error: 'item_id, purchase_date, quantity, unit_cost are required' }, { status: 400 });
    }

    const qty = parseInt(quantity);
    const cost = parseFloat(unit_cost);

    if (qty <= 0) return NextResponse.json({ error: 'quantity must be positive' }, { status: 400 });
    if (cost <= 0) return NextResponse.json({ error: 'unit_cost must be positive' }, { status: 400 });

    const total_cost = parseFloat((qty * cost).toFixed(2));

    const db = getDb();

    // Verify item exists
    const [items] = await db.query('SELECT id FROM ledger_items WHERE id = ?', [item_id]);
    if (items.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const [result] = await db.query(
      `INSERT INTO ledger_purchases (item_id, purchase_date, supplier, quantity, unit_cost, total_cost, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item_id, purchase_date, supplier || null, qty, cost, total_cost, note || null]
    );

    return NextResponse.json({ id: result.insertId, total_cost, message: 'Purchase recorded' }, { status: 201 });
  } catch (error) {
    console.error('Purchases POST Error:', error);
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }
}
