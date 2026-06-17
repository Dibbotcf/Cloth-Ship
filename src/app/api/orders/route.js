import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req) {
  try {
    const data = await req.json();
    const { form, cart, total, shipping } = data;
    const db = getDb();

    // Generate Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

    // Insert Order
    const [orderResult] = await db.query(`
      INSERT INTO orders (
        order_number, customer_name, email, phone, 
        address, city, zip, payment_method, 
        total_amount, shipping_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `, [
      orderNumber, form.name, form.email, form.phone,
      form.address, form.city, form.zip, form.paymentMethod,
      total, shipping
    ]);

    const orderId = orderResult.insertId;

    // Insert Order Items
    for (const item of cart) {
      await db.query(`
        INSERT INTO order_items (
          order_id, product_id, product_name, size, quantity, price
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId, 
        item.id || 0, // Fallback if no specific ID 
        item.name, 
        item.selectedSize || 'Free Size', 
        item.quantity, 
        item.price
      ]);
    }

    return NextResponse.json({ success: true, orderId, orderNumber });
  } catch (error) {
    console.error('Order Submission Error:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
