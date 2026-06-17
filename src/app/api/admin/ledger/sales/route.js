import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all sales with item name
export async function GET() {
  try {
    const db = getDb();
    const [rows] = await db.query(`
      SELECT s.*, i.name AS item_name, i.unit AS item_unit
      FROM ledger_sales s
      JOIN ledger_items i ON i.id = s.item_id
      ORDER BY s.sale_date DESC, s.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Sales GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

// POST record a sale — validates stock, auto-computes cost_of_goods via weighted avg
export async function POST(request) {
  try {
    const { item_id, sale_date, customer, quantity, unit_price, payment_status, note } = await request.json();

    if (!item_id || !sale_date || !quantity || !unit_price) {
      return NextResponse.json({ error: 'item_id, sale_date, quantity, unit_price are required' }, { status: 400 });
    }

    const qty = parseInt(quantity);
    const price = parseFloat(unit_price);

    if (qty <= 0) return NextResponse.json({ error: 'quantity must be positive' }, { status: 400 });
    if (price <= 0) return NextResponse.json({ error: 'unit_price must be positive' }, { status: 400 });

    const db = getDb();

    // Verify item exists
    const [items] = await db.query('SELECT id FROM ledger_items WHERE id = ?', [item_id]);
    if (items.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // --- Stock validation ---
    const [[stockRow]] = await db.query(
      'SELECT COALESCE(SUM(quantity), 0) AS total FROM ledger_purchases WHERE item_id = ?',
      [item_id]
    );
    const [[soldRow]] = await db.query(
      'SELECT COALESCE(SUM(quantity), 0) AS total FROM ledger_sales WHERE item_id = ?',
      [item_id]
    );
    const inStock = Number(stockRow.total) - Number(soldRow.total);
    if (qty > inStock) {
      return NextResponse.json(
        { error: `Insufficient stock. Only ${inStock} unit(s) available for this item.`, inStock },
        { status: 422 }
      );
    }

    // --- Weighted average cost for cost_of_goods ---
    const [[costRow]] = await db.query(
      `SELECT
        COALESCE(SUM(total_cost), 0) AS total_cost,
        COALESCE(SUM(quantity), 0)   AS total_qty
       FROM ledger_purchases WHERE item_id = ?`,
      [item_id]
    );
    const avgCost = Number(costRow.total_qty) > 0
      ? Number(costRow.total_cost) / Number(costRow.total_qty)
      : 0;
    const cost_of_goods = parseFloat((qty * avgCost).toFixed(2));
    const total_amount  = parseFloat((qty * price).toFixed(2));

    const [result] = await db.query(
      `INSERT INTO ledger_sales
        (item_id, sale_date, customer, quantity, unit_price, total_amount, cost_of_goods, payment_status, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item_id, sale_date, customer || null, qty, price,
        total_amount, cost_of_goods,
        payment_status || 'paid', note || null
      ]
    );

    const profit = parseFloat((total_amount - cost_of_goods).toFixed(2));
    return NextResponse.json({
      id: result.insertId,
      total_amount,
      cost_of_goods,
      profit,
      message: 'Sale recorded'
    }, { status: 201 });

  } catch (error) {
    console.error('Sales POST Error:', error);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}
