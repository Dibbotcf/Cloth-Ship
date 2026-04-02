import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    // Run three queries in parallel for efficiency
    const [productsResult] = await db.query('SELECT COUNT(*) as count FROM products');
    const [ordersResult] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [revenueResult] = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE status != "Cancelled"');
    
    return NextResponse.json({
      products: productsResult[0].count,
      orders: ordersResult[0].count,
      revenue: revenueResult[0].total || 0,
    });
  } catch (error) {
    console.error('Database Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
