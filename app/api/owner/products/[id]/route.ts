import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function verifyOwnerToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader?.startsWith('Bearer owner-') || false;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!verifyOwnerToken(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gamesTable = supabase.from('games') as any;
    const { data, error } = await gamesTable
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

    return NextResponse.json({ game: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!verifyOwnerToken(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Prepare update data, converting string IDs and arrays
    const updateData: any = { ...body };
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discount_percent) updateData.discount_percent = parseInt(updateData.discount_percent);
    if (updateData.slug) updateData.slug = updateData.slug.toLowerCase().replace(/\s+/g, '-');
    updateData.updated_at = new Date().toISOString();

    const gamesTable = supabase.from('games') as any;
    const { data, error } = await gamesTable
      .update(updateData)
      .eq('id', params.id)
      .select();

    if (error) throw error;
    return NextResponse.json({ game: data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!verifyOwnerToken(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gamesTable = supabase.from('games') as any;
    const { error } = await gamesTable
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
