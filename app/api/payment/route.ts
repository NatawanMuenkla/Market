import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, paymentStatus } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    // Get order
    const ordersTable = supabase.from('orders') as any;
    const { data: order } = await ordersTable
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Update order status
    const { error: updateError } = await ordersTable
      .update({ status: paymentStatus === 'succeeded' ? 'completed' : 'cancelled' })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Record transaction
    const transactionsTable = supabase.from('transactions') as any;
    await transactionsTable.insert({
      order_id: orderId,
      user_id: userId,
      amount: order.total,
      status: paymentStatus,
      currency: 'usd',
    });

    // If successful, increment coupon usage
    if (paymentStatus === 'succeeded' && order.coupon_id) {
      const couponsTable = supabase.from('coupons') as any;
      const { data: coupon } = await couponsTable
        .select('used_count')
        .eq('id', order.coupon_id)
        .maybeSingle();

      if (coupon) {
        await couponsTable
          .update({ used_count: (coupon.used_count || 0) + 1 })
          .eq('id', order.coupon_id);
      }
    }

    return NextResponse.json({ success: true, status: paymentStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
