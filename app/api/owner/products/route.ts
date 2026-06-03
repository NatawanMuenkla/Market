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

    const gamesTable = supabase.from('games') as any;
    const { data, error } = await gamesTable
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ games: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyOwnerToken(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      short_description,
      price,
      discount_percent,
      developer,
      publisher,
      cover_image,
      banner_image,
      trailer_url,
      category_id,
      platform,
      tags,
      release_date,
      is_featured,
      is_trending,
      is_new_release,
      is_top_seller,
    } = body;

    if (!title || !slug || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gamesTable = supabase.from('games') as any;
    const { data, error } = await gamesTable
      .insert({
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description,
        short_description,
        price: parseFloat(price),
        discount_percent: parseInt(discount_percent) || 0,
        developer: developer || '',
        publisher: publisher || '',
        cover_image: cover_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
        banner_image: banner_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
        trailer_url: trailer_url || '',
        category_id: category_id || null,
        platform: platform || [],
        tags: tags || [],
        release_date: release_date || null,
        is_featured: is_featured || false,
        is_trending: is_trending || false,
        is_new_release: is_new_release || false,
        is_top_seller: is_top_seller || false,
        is_active: true,
      })
      .select();

    if (error) throw error;
    return NextResponse.json({ game: data?.[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
