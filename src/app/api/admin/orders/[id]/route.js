import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDb();
    
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    
    return NextResponse.json({ ...orders[0], items });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await request.json();
    const db = getDb();
    
    // If only status is provided (for the quick status update in the table)
    if (Object.keys(data).length === 1 && data.status) {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', [data.status, id]);
      return NextResponse.json({ message: 'Order status updated' });
    }

    // Full update
    await db.query(`
      UPDATE orders SET 
        customer_name = ?, email = ?, phone = ?, address = ?, 
        city = ?, zip = ?, payment_method = ?, total_amount = ?, 
        shipping_amount = ?, status = ?
      WHERE id = ?
    `, [
      data.customer_name, data.email, data.phone, data.address,
      data.city, data.zip, data.payment_method, data.total_amount,
      data.shipping_amount, data.status, id
    ]);
    
    // For order items, it's easier to delete and re-insert
    if (data.items && Array.isArray(data.items)) {
      await db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
      for (const item of data.items) {
        await db.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name, size, quantity, price
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          id, item.product_id || 0, item.product_name, item.size, item.quantity, item.price
        ]);
      }
    }

    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const db = getDb();
    
    await db.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    await db.query('DELETE FROM orders WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
