import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const { status } = await request.json();
    const db = getDb();
    
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    return NextResponse.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
