import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, couponCode, subtotal } = await req.json();
    if (!items || items.length === 0) return NextResponse.json({ error: 'No items' }, { status: 400 });

    // Validate coupon if provided
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const couponTable = supabase.from('coupons') as any;
      const { data: coupon } = await couponTable
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (coupon) {
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
        }
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
          return NextResponse.json({ error: 'Coupon limit reached' }, { status: 400 });
        }
        discountAmount = coupon.discount_type === 'percent' ? subtotal * (coupon.discount_value / 100) : Math.min(coupon.discount_value, subtotal);
        couponId = coupon.id;
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    // Create order
    const ordersTable = supabase.from('orders') as any;
    const { data: order, error: orderError } = await ordersTable
      .insert({
        user_id: userId,
        subtotal,
        discount_amount: discountAmount,
        total,
        coupon_id: couponId,
        coupon_code: couponCode,
        status: 'pending',
      })
      .select();

    if (orderError) throw orderError;
    const orderId = order[0].id;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      game_id: item.id,
      game_title: item.title,
      game_cover: item.cover_image,
      price: item.price * (1 - (item.discount_percent || 0) / 100),
      quantity: 1,
    }));

    const orderItemsTable = supabase.from('order_items') as any;
    const { error: itemsError } = await orderItemsTable.insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear cart
    const cartTable = supabase.from('cart_items') as any;
    await cartTable.delete().eq('user_id', userId);

    return NextResponse.json({ orderId, total, discount: discountAmount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ordersTable = supabase.from('orders') as any;
    const { data, error } = await ordersTable
      .select('*, order_items(*, games(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ orders: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
