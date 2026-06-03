'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GameCard from '@/components/GameCard';
import type { Game } from '@/types/database';

interface GameSectionProps {
  title: string;
  subtitle?: string;
  games: Game[];
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function GameSection({ title, subtitle, games, variant = 'default' }: GameSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  if (games.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {games.map(game => (
            <div
              key={game.id}
              className="shrink-0"
              style={{
                scrollSnapAlign: 'start',
                width: variant === 'compact' ? '160px' : variant === 'horizontal' ? '100%' : '280px',
              }}
            >
              <GameCard game={game} variant={variant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
