import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function verifyOwnerToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader?.startsWith('Bearer owner-') || false;
}

export async function GET(req: NextRequest) {
  try {
    if (!verifyOwnerToken(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ordersTable = supabase.from('orders') as any;
    const { data, error } = await ordersTable
      .select('*, order_items(*, games(*)), profiles(email, display_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ orders: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
