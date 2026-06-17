import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const db = getDb();
    
    const [rows] = await db.query('SELECT id FROM ledger_purchases WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const qty = parseInt(data.quantity);
    const cost = parseFloat(data.unit_cost);
    if (qty <= 0) return NextResponse.json({ error: 'quantity must be positive' }, { status: 400 });
    if (cost <= 0) return NextResponse.json({ error: 'unit_cost must be positive' }, { status: 400 });
    const total_cost = parseFloat((qty * cost).toFixed(2));

    await db.query(
      `UPDATE ledger_purchases 
       SET purchase_date = ?, supplier = ?, quantity = ?, unit_cost = ?, total_cost = ?, note = ?
       WHERE id = ?`,
      [data.purchase_date, data.supplier || null, qty, cost, total_cost, data.note || null, id]
    );

    return NextResponse.json({ message: 'Purchase updated successfully' });
  } catch (error) {
    console.error('Purchase PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const [rows] = await db.query('SELECT id FROM ledger_purchases WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }
    await db.query('DELETE FROM ledger_purchases WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Purchase deleted' });
  } catch (error) {
    console.error('Purchase DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}
