import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all ledger items with their current stock levels
export async function GET() {
  try {
    const db = getDb();
    const [rows] = await db.query(`
      SELECT
        i.*,
        COALESCE(SUM(p.quantity), 0)                                   AS total_purchased,
        COALESCE(SUM(s.quantity), 0)                                   AS total_sold,
        COALESCE(SUM(p.quantity), 0) - COALESCE(SUM(s.quantity), 0)   AS units_in_stock,
        COALESCE(SUM(p.total_cost), 0)                                 AS total_invested
      FROM ledger_items i
      LEFT JOIN ledger_purchases p ON p.item_id = i.id
      LEFT JOIN ledger_sales s     ON s.item_id = i.id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Ledger Items GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST create a new ledger item
export async function POST(request) {
  try {
    const { name, category, sku, unit, notes } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }
    const db = getDb();
    const [result] = await db.query(
      'INSERT INTO ledger_items (name, category, sku, unit, notes) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), category || null, sku || null, unit || 'piece', notes || null]
    );
    return NextResponse.json({ id: result.insertId, message: 'Item created' }, { status: 201 });
  } catch (error) {
    console.error('Ledger Items POST Error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
