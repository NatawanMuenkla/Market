import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cartTable = supabase.from('cart_items') as any;
    const { data, error } = await cartTable
      .select('*, games(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gameId, quantity = 1 } = await req.json();
    if (!gameId) return NextResponse.json({ error: 'gameId required' }, { status: 400 });

    const cartTable = supabase.from('cart_items') as any;
    const { data: existing } = await cartTable
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();

    let result;
    if (existing) {
      result = await cartTable
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select();
    } else {
      result = await cartTable
        .insert({ user_id: userId, game_id: gameId, quantity })
        .select();
    }

    return NextResponse.json(result.data?.[0] || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');
    if (!itemId) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const cartTable = supabase.from('cart_items') as any;
    const { error } = await cartTable
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { itemId, quantity } = await req.json();
    if (!itemId || quantity === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const cartTable = supabase.from('cart_items') as any;
    if (quantity <= 0) {
      const { error } = await cartTable
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await cartTable
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', userId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
