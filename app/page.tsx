import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/home/HeroSection';
import GameSection from '@/components/home/GameSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import StatsSection from '@/components/home/StatsSection';
import Link from 'next/link';

async function getHomeData() {
  const [
    { data: featuredGames },
    { data: trendingGames },
    { data: newReleases },
    { data: topSellers },
    { data: categories },
  ] = await Promise.all([
    supabase.from('games').select('*').eq('is_featured', true).eq('is_active', true).limit(5),
    supabase.from('games').select('*').eq('is_trending', true).eq('is_active', true).limit(10),
    supabase.from('games').select('*').eq('is_new_release', true).eq('is_active', true).limit(10),
    supabase.from('games').select('*').eq('is_top_seller', true).eq('is_active', true).order('rating', { ascending: false }).limit(10),
    supabase.from('categories').select('*').order('name').limit(8),
  ]);

  return {
    featuredGames: featuredGames || [],
    trendingGames: trendingGames || [],
    newReleases: newReleases || [],
    topSellers: topSellers || [],
    categories: categories || [],
  };
}

export default async function HomePage() {
  const { featuredGames, trendingGames, newReleases, topSellers, categories } = await getHomeData();

  return (
    <main className="bg-[#050508] min-h-screen">
      <HeroSection featuredGames={featuredGames} />
      <StatsSection />

      {trendingGames.length > 0 && (
        <GameSection
          title="Trending Now"
          subtitle="The most popular games this week"
          games={trendingGames}
        />
      )}

      <CategoriesSection categories={categories} />

      {newReleases.length > 0 && (
        <GameSection
          title="New Releases"
          subtitle="Fresh games just added to the store"
          games={newReleases}
        />
      )}

      {topSellers.length > 0 && (
        <GameSection
          title="Top Sellers"
          subtitle="Bestsellers loved by our community"
          games={topSellers}
        />
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1a2e] to-[#0a1520] border border-blue-500/20 p-8">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-blue-500/5 to-transparent" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Explore Our Full Catalog</h2>
                <p className="text-gray-400">Browse thousands of games across all genres, platforms, and price ranges.</p>
              </div>
              <Link
                href="/marketplace"
                className="shrink-0 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 whitespace-nowrap"
              >
                Browse All Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection />
      <NewsletterSection />
    </main>
  );
}
