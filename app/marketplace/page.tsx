'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Grid, List, X, ChevronDown, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import GameCard from '@/components/GameCard';
import type { Game, Category } from '@/types/database';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Best Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'title', label: 'Title A-Z' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: 'rating',
    priceRange: [0, 100] as [number, number],
    platform: '' as string,
    rating: 0,
    onSale: searchParams.get('filter') === 'sale',
    platforms: [] as string[],
  });

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'trending') setFilters(f => ({ ...f, sort: 'rating' }));
    if (filter === 'new') setFilters(f => ({ ...f, sort: 'newest' }));
    if (filter === 'top') setFilters(f => ({ ...f, sort: 'rating' }));
  }, [searchParams]);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    let query = supabase.from('games').select('*', { count: 'exact' }).eq('is_active', true);

    if (filters.search) query = query.ilike('title', `%${filters.search}%`);
    if (filters.category) {
      const cat = categories.find(c => c.slug === filters.category);
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (filters.onSale) query = query.gt('discount_percent', 0);
    if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
    if (filters.priceRange[1] < 100) query = query.lte('price', filters.priceRange[1]);
    if (filters.rating > 0) query = query.gte('rating', filters.rating);

    const filter = searchParams.get('filter');
    if (filter === 'trending') query = query.eq('is_trending', true);
    if (filter === 'new') query = query.eq('is_new_release', true);
    if (filter === 'top') query = query.eq('is_top_seller', true);

    if (filters.sort === 'rating') query = query.order('rating', { ascending: false });
    else if (filters.sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (filters.sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (filters.sort === 'title') query = query.order('title', { ascending: true });

    const from = (currentPage - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;
    setGames(data || []);
    setTotalCount(count || 0);
    setIsLoading(false);
  }, [filters, currentPage, categories, searchParams]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const clearFilters = () => {
    setFilters({ search: '', category: '', sort: 'rating', priceRange: [0, 100], platform: '', rating: 0, onSale: false, platforms: [] });
    setCurrentPage(1);
    router.push('/marketplace');
  };

  const activeFilterCount = [
    filters.search, filters.category, filters.onSale,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100,
    filters.rating > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#050508] pt-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0d1117] to-[#050508] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Game Store</h1>

          {/* Search + Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search games, genres, developers..."
                value={filters.search}
                onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              {filters.search && (
                <button onClick={() => setFilters(f => ({ ...f, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                showFilters ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-cyan-500 rounded-full text-xs text-white flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>

            <select
              value={filters.sort}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 transition-all"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#12121a]">{opt.label}</option>
              ))}
            </select>

            <div className="flex border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2.5 transition-colors', viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white')}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2.5 transition-colors', viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-5 bg-white/3 border border-white/8 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Genre</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters(f => ({ ...f, category: '' }))}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', !filters.category ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20')}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters(f => ({ ...f, category: cat.slug }))}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filters.category === cat.slug ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20')}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1] === 100 ? '100+' : filters.priceRange[1]}
                </label>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={filters.priceRange}
                  onValueChange={val => setFilters(f => ({ ...f, priceRange: val as [number, number] }))}
                  className="w-full"
                />
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Minimum Rating</label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map(r => (
                    <button
                      key={r}
                      onClick={() => setFilters(f => ({ ...f, rating: r }))}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filters.rating === r ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20')}
                    >
                      {r === 0 ? 'All' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sale Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Deals</label>
                <button
                  onClick={() => setFilters(f => ({ ...f, onSale: !f.onSale }))}
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all', filters.onSale ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20')}
                >
                  On Sale Only
                </button>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {isLoading ? 'Loading...' : `${totalCount.toLocaleString()} game${totalCount !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Games Grid/List */}
        {isLoading ? (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/3 border border-white/5 overflow-hidden animate-pulse">
                <div className="aspect-video bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No games found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-3xl'
            )}>
              {games.map(game => (
                <GameCard key={game.id} game={game} variant={viewMode === 'list' ? 'horizontal' : 'default'} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                        currentPage === page
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
