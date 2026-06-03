import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Monitor, Apple, Cpu, Calendar, Tag, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Gallery from '@/components/game/Gallery';
import SystemRequirements from '@/components/game/SystemRequirements';
import GameSection from '@/components/home/GameSection';
import AddToCartButton from '@/components/game/AddToCartButton';
import type { Game, GameScreenshot, GameRequirement, Category, Review, Profile } from '@/types/database';

type ReviewWithProfile = Review & { profiles: Pick<Profile, 'display_name' | 'avatar_url'> | null };

interface Props {
  params: { slug: string };
}

async function getGameData(slug: string) {
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle() as { data: Game | null };

  if (!game) return null;

  const [
    screenshotsResult,
    requirementsResult,
    reviewsResult,
    relatedResult,
    categoryResult,
  ] = await Promise.all([
    supabase.from('game_screenshots').select('*').eq('game_id', game.id).order('sort_order'),
    supabase.from('game_requirements').select('*').eq('game_id', game.id),
    supabase.from('reviews').select('*, profiles(display_name, avatar_url)').eq('game_id', game.id).order('created_at', { ascending: false }).limit(10) as unknown as Promise<{ data: ReviewWithProfile[] | null }>,
    game.category_id
      ? supabase.from('games').select('*').eq('category_id', game.category_id).neq('id', game.id).limit(6)
      : Promise.resolve({ data: [] as Game[] }),
    game.category_id
      ? supabase.from('categories').select('*').eq('id', game.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const screenshots = (screenshotsResult.data as GameScreenshot[] | null) || [];
  const requirements = (requirementsResult.data as GameRequirement[] | null) || [];
  const relatedGames = ((relatedResult as { data: Game[] | null }).data) || [];
  const category = (categoryResult as { data: Category | null }).data;
  const reviews = (reviewsResult.data as ReviewWithProfile[] | null) || [];

  return { game, screenshots, requirements, reviews, relatedGames, category };
}

export default async function GameDetailPage({ params }: Props) {
  const data = await getGameData(params.slug);
  if (!data) notFound();

  const { game, screenshots, requirements, reviews, relatedGames, category } = data;
  const discountedPrice = game.discount_percent
    ? game.price * (1 - game.discount_percent / 100)
    : game.price;

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="min-h-screen bg-[#050508] pt-16">
      {/* Banner */}
      <div
        className="relative h-72 md:h-96 overflow-hidden"
        style={{
          backgroundImage: `url(${game.banner_image || game.cover_image || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        {/* Back Link */}
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Area */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {category && (
                  <Link href={`/marketplace?category=${category.slug}`} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-medium text-cyan-400 hover:bg-cyan-500/30 transition-all">
                    {category.name}
                  </Link>
                )}
                {game.is_new_release && <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-medium text-blue-400">New Release</span>}
                {game.is_top_seller && <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-medium text-amber-400">Top Seller</span>}
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{game.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(game.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-white font-semibold">{(game.rating || 0).toFixed(1)}</span>
                  <span>({game.review_count?.toLocaleString()} reviews)</span>
                </div>
                <span className="text-gray-600">•</span>
                <span>{game.developer}</span>
                {game.release_date && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(game.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </>
                )}
              </div>
            </div>

            {/* Gallery */}
            <Gallery screenshots={screenshots} title={game.title} />

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">About This Game</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{game.description}</p>
              </div>
            </div>

            {/* Tags */}
            {game.tags && game.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* System Requirements */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">System Requirements</h2>
              <SystemRequirements requirements={requirements} />
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Player Reviews</h2>

              {reviews.length > 0 && (
                <div className="p-5 bg-white/3 border border-white/8 rounded-xl mb-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-5xl font-black text-white">{(game.rating || 0).toFixed(1)}</p>
                      <div className="flex justify-center gap-0.5 my-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(game.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">{game.review_count?.toLocaleString()} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingBreakdown.map(({ star, count, percent }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-4">{star}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm py-8 text-center">No reviews yet. Be the first to review this game.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="p-4 bg-white/3 border border-white/8 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {(review as any).profiles?.display_name || 'Anonymous User'}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(review.created_at!).toLocaleDateString()}</span>
                      </div>
                      {review.title && <p className="text-sm font-semibold text-white mb-1">{review.title}</p>}
                      <p className="text-sm text-gray-300 leading-relaxed">{review.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="sticky top-20">
              {/* Game Image */}
              <div className="rounded-xl overflow-hidden aspect-[3/4] mb-4">
                <img
                  src={game.cover_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg'}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Purchase Card */}
              <div className="p-5 bg-[#12121a] border border-white/10 rounded-xl">
                <div className="mb-4">
                  {game.discount_percent ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs font-bold text-green-400">
                          -{game.discount_percent}%
                        </span>
                        <span className="text-gray-500 line-through text-sm">${game.price.toFixed(2)}</span>
                      </div>
                      <p className="text-3xl font-black text-white">${discountedPrice.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="text-3xl font-black text-white">${game.price.toFixed(2)}</p>
                  )}
                </div>

                <AddToCartButton game={game} />

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Developer</span>
                    <span className="text-gray-200 font-medium">{game.developer}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Publisher</span>
                    <span className="text-gray-200 font-medium">{game.publisher}</span>
                  </div>
                  {game.release_date && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Release Date</span>
                      <span className="text-gray-200 font-medium">{new Date(game.release_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Platforms</span>
                    <div className="flex items-center gap-1">
                      {(game.platform || []).map(p => (
                        <span key={p} className="text-gray-200 font-medium capitalize">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Games */}
        {relatedGames.length > 0 && (
          <div className="mt-16">
            <GameSection title="More Like This" games={relatedGames} />
          </div>
        )}
      </div>
    </div>
  );
}
