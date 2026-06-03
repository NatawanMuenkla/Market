import Link from 'next/link';
import { Sword, Crown, Target, Trophy, Map, Ghost, Car, Puzzle } from 'lucide-react';
import type { Category } from '@/types/database';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sword, Crown, Target, Trophy, Map, Ghost, Car, Puzzle,
};

const colorMap = [
  'from-cyan-500/20 to-blue-600/20 border-cyan-500/20 hover:border-cyan-500/40',
  'from-amber-500/20 to-orange-600/20 border-amber-500/20 hover:border-amber-500/40',
  'from-green-500/20 to-teal-600/20 border-green-500/20 hover:border-green-500/40',
  'from-red-500/20 to-pink-600/20 border-red-500/20 hover:border-red-500/40',
  'from-blue-500/20 to-cyan-600/20 border-blue-500/20 hover:border-blue-500/40',
  'from-emerald-500/20 to-green-600/20 border-emerald-500/20 hover:border-emerald-500/40',
  'from-sky-500/20 to-blue-600/20 border-sky-500/20 hover:border-sky-500/40',
  'from-violet-500/20 to-blue-600/20 border-violet-500/20 hover:border-violet-500/40',
];

const iconColorMap = [
  'text-cyan-400', 'text-amber-400', 'text-green-400', 'text-red-400',
  'text-blue-400', 'text-emerald-400', 'text-sky-400', 'text-violet-400',
];

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Browse by Genre</h2>
          <p className="text-gray-400">Find games in your favorite categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => {
            const IconComponent = iconMap[cat.icon || 'Sword'] || Sword;
            const colorClass = colorMap[i % colorMap.length];
            const iconColor = iconColorMap[i % iconColorMap.length];

            return (
              <Link
                key={cat.id}
                href={`/marketplace?category=${cat.slug}`}
                className={`group flex flex-col items-center gap-3 p-4 bg-gradient-to-br ${colorClass} border rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
