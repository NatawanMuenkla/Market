'use client';

import { ShoppingCart, Heart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import type { Game } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';

interface AddToCartButtonProps {
  game: Game;
}

export default function AddToCartButton({ game }: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInCart, isInWishlist } = useStore();
  const inCart = isInCart(game.id);
  const inWishlist = isInWishlist(game.id);

  return (
    <div className="space-y-2">
      {inCart ? (
        <Link
          href="/cart"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          View in Cart
        </Link>
      ) : (
        <button
          onClick={() => {
            if (!user) {
              toast.error('Please sign in first');
              return;
            }
            addToCart(game);
            toast.success(`${game.title} added to cart`);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      )}

      <button
        onClick={() => {
          if (!user) {
            toast.error('Please sign in first');
            return;
          }
          toggleWishlist(game);
          toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
        }}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
          inWishlist
            ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
            : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
        )}
      >
        <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
        {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </button>
    </div>
  );
}
