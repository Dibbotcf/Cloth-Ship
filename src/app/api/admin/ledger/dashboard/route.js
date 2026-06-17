import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const [[capitalRow]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM ledger_capital'
    );
    const [[purchaseRow]] = await db.query(
      'SELECT COALESCE(SUM(total_cost), 0) AS total FROM ledger_purchases'
    );
    const [[salesRow]] = await db.query(
      'SELECT COALESCE(SUM(total_amount), 0) AS total FROM ledger_sales'
    );
    const [[cogRow]] = await db.query(
      'SELECT COALESCE(SUM(cost_of_goods), 0) AS total FROM ledger_sales'
    );

    const totalCapital        = Number(capitalRow.total);
    const totalStockInvest    = Number(purchaseRow.total);
    const totalSalesRevenue   = Number(salesRow.total);
    const costOfGoodsSold     = Number(cogRow.total);
    const netProfit           = totalSalesRevenue - costOfGoodsSold;
    const remainingCash       = totalCapital - totalStockInvest + totalSalesRevenue;
    const stockValueRemaining = totalStockInvest - costOfGoodsSold;

    return NextResponse.json({
      currency: 'BDT',
      total_capital:         totalCapital,
      total_stock_investment: totalStockInvest,
      total_sales_revenue:   totalSalesRevenue,
      cost_of_goods_sold:    costOfGoodsSold,
      net_profit:            netProfit,
      remaining_cash:        remainingCash,
      stock_value_remaining: stockValueRemaining,
    });
  } catch (error) {
    console.error('Ledger Dashboard Error:', error);
    return NextResponse.json({ error: 'Failed to compute dashboard KPIs' }, { status: 500 });
  }
}
