'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Tag, Play } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Game } from '@/types/database';
import { toast } from 'sonner';

interface HeroSectionProps {
  featuredGames: Game[];
}

export default function HeroSection({ featuredGames }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { addToCart, isInCart } = useStore();

  useEffect(() => {
    if (featuredGames.length === 0) return;
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % featuredGames.length);
        setIsAnimating(false);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredGames.length]);

  if (featuredGames.length === 0) {
    return (
      <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-gradient-to-br from-[#0a0a12] to-[#050508]">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">NexusStore</span></h1>
          <p className="text-gray-400 text-xl mb-8">Your ultimate gaming marketplace</p>
          <Link href="/marketplace" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30">
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  const game = featuredGames[current];
  const discountedPrice = game.discount_percent
    ? game.price * (1 - game.discount_percent / 100)
    : game.price;
  const inCart = isInCart(game.id);

  const handleNav = (dir: 1 | -1) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(prev => (prev + dir + featuredGames.length) % featuredGames.length);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background */}
      <div
        className={cn('absolute inset-0 transition-opacity duration-500', isAnimating ? 'opacity-0' : 'opacity-100')}
        style={{
          backgroundImage: `url(${game.banner_image || game.cover_image || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508]/20" />
      </div>

      {/* Content */}
      <div className={cn(
        'relative z-10 h-full flex items-center transition-all duration-500',
        isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              {game.is_featured && (
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400">
                  Featured
                </span>
              )}
              {game.is_top_seller && (
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-400">
                  Top Seller
                </span>
              )}
              {game.discount_percent ? (
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-semibold text-green-400">
                  -{game.discount_percent}% OFF
                </span>
              ) : null}
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
              {game.title}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={cn('w-4 h-4', s <= Math.round(game.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-600')} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">{(game.rating || 0).toFixed(1)} ({game.review_count?.toLocaleString()} reviews)</span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 line-clamp-3">
              {game.short_description || game.description}
            </p>

            <div className="flex items-center gap-4">
              <div>
                {game.discount_percent ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-base">${game.price.toFixed(2)}</span>
                    <span className="text-3xl font-black text-white">${discountedPrice.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-black text-white">${game.price.toFixed(2)}</span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!inCart) {
                      addToCart(game);
                      toast.success(`${game.title} added to cart`);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg',
                    inCart
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105'
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
                <Link
                  href={`/game/${game.slug}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all"
                >
                  <Play className="w-4 h-4" />
                  Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={() => handleNav(-1)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {featuredGames.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === current ? 'w-6 h-2 bg-cyan-400' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              )}
            />
          ))}
        </div>
        <button
          onClick={() => handleNav(1)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
