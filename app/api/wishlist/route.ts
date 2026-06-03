import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wishlistTable = supabase.from('wishlists') as any;
    const { data, error } = await wishlistTable
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

    const { gameId } = await req.json();
    if (!gameId) return NextResponse.json({ error: 'gameId required' }, { status: 400 });

    const wishlistTable = supabase.from('wishlists') as any;
    const { data: existing } = await wishlistTable
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();

    if (existing) {
      const { error } = await wishlistTable
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return NextResponse.json({ added: false });
    }

    const { data, error } = await wishlistTable
      .insert({ user_id: userId, game_id: gameId })
      .select();

    if (error) throw error;
    return NextResponse.json({ added: true, item: data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    if (!gameId) return NextResponse.json({ error: 'gameId required' }, { status: 400 });

    const wishlistTable = supabase.from('wishlists') as any;
    const { error } = await wishlistTable
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
