'use client';

import Link from 'next/link';
import { Star, ShoppingCart, Heart, Tag, Monitor, Apple, Cpu } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Game } from '@/types/database';
import { toast } from 'sonner';

interface GameCardProps {
  game: Game;
  variant?: 'default' | 'compact' | 'horizontal';
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'windows') return <Monitor className="w-3 h-3" />;
  if (platform === 'mac') return <Apple className="w-3 h-3" />;
  if (platform === 'linux') return <Cpu className="w-3 h-3" />;
  return null;
}

export default function GameCard({ game, variant = 'default' }: GameCardProps) {
  const { addToCart, toggleWishlist, isInCart, isInWishlist } = useStore();
  const inCart = isInCart(game.id);
  const inWishlist = isInWishlist(game.id);

  const discountedPrice = game.discount_percent
    ? game.price * (1 - game.discount_percent / 100)
    : game.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addToCart(game);
      toast.success(`${game.title} added to cart`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(game);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/game/${game.slug}`} className="group flex gap-4 p-4 bg-white/3 border border-white/8 rounded-xl hover:bg-white/5 hover:border-white/15 transition-all">
        <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
          <img
            src={game.cover_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg'}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{game.title}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-400">{(game.rating || 0).toFixed(1)}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {game.discount_percent ? (
            <>
              <span className="text-xs line-through text-gray-500">${game.price.toFixed(2)}</span>
              <p className="text-sm font-bold text-cyan-400">${discountedPrice.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-white">${game.price.toFixed(2)}</p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/game/${game.slug}`} className="group block">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
          <img
            src={game.cover_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg'}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {game.discount_percent ? (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 rounded text-xs font-bold text-white">
              -{game.discount_percent}%
            </div>
          ) : null}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
            <p className="text-white text-xs font-semibold truncate">{game.title}</p>
            <p className="text-cyan-400 text-xs font-bold mt-0.5">${discountedPrice.toFixed(2)}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/game/${game.slug}`} className="group block">
      <div className={cn(
        'relative rounded-xl overflow-hidden bg-[#12121a] border border-white/8 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10',
      )}>
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={game.cover_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg'}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {game.is_new_release && (
              <span className="px-2 py-0.5 bg-blue-500 rounded text-xs font-bold text-white">NEW</span>
            )}
            {game.is_top_seller && (
              <span className="px-2 py-0.5 bg-amber-500 rounded text-xs font-bold text-white">TOP</span>
            )}
            {game.discount_percent ? (
              <span className="px-2 py-0.5 bg-green-500 rounded text-xs font-bold text-white">
                -{game.discount_percent}%
              </span>
            ) : null}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100',
              inWishlist
                ? 'bg-red-500/80 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-red-500/60 hover:text-white'
            )}
          >
            <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm leading-tight mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2 truncate">{game.developer}</p>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs text-gray-300 font-medium">{(game.rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-gray-600">•</span>
            <div className="flex items-center gap-1">
              {(game.platform || []).slice(0, 3).map(p => (
                <span key={p} className="text-gray-400">
                  <PlatformIcon platform={p} />
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {game.discount_percent ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 line-through">${game.price.toFixed(2)}</span>
                  <span className="text-base font-bold text-cyan-400">${discountedPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-base font-bold text-white">${game.price.toFixed(2)}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                inCart
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300'
              )}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {inCart ? 'In Cart' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
