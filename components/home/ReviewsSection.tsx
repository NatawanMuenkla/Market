import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const reviews = [
  {
    id: 1,
    name: 'Alex Thompson',
    avatar: 'AT',
    rating: 5,
    game: 'Cyber Nexus 2077',
    content: 'Absolutely incredible experience. The open world feels alive and every decision matters. Best purchase I made this year without question.',
    date: '2 days ago',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    avatar: 'SC',
    rating: 5,
    game: 'Mind Labyrinth',
    content: 'I have never had so much fun solving puzzles. The progression is perfectly designed and the art style is stunning. Highly recommended!',
    date: '1 week ago',
  },
  {
    id: 3,
    name: 'Marcus Rodriguez',
    avatar: 'MR',
    rating: 5,
    game: 'Shadow Realm Chronicles',
    content: 'The storytelling in this game is on another level. I played for 80 hours and there was always something new to discover. Pure magic.',
    date: '3 days ago',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    avatar: 'EW',
    rating: 4,
    game: 'Velocity Strike',
    content: 'Super fun racing game with tons of content. Online multiplayer is competitive and addictive. The track variety keeps it fresh.',
    date: '5 days ago',
  },
  {
    id: 5,
    name: 'James Park',
    avatar: 'JP',
    rating: 5,
    game: 'Phantom Horror: Awakening',
    content: 'This game genuinely scared me multiple times. The adaptive AI makes every playthrough feel different. Masterclass in horror game design.',
    date: '4 days ago',
  },
  {
    id: 6,
    name: 'Priya Sharma',
    avatar: 'PS',
    rating: 5,
    game: 'Galaxy Quest: Infinite',
    content: 'I have been playing for 200+ hours and still discovering new things. The procedural generation is mind-blowing. A true space exploration epic.',
    date: '1 day ago',
  },
];

export default function ReviewsSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">What Gamers Are Saying</h2>
          <p className="text-gray-400">Trusted by millions of players worldwide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className="relative p-6 bg-white/[0.03] border border-white/8 rounded-xl hover:border-white/15 transition-all"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-cyan-500/10" />
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-cyan-400 text-xs font-semibold">
                    {review.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.game}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                ))}
                <span className="text-xs text-gray-500 ml-2">{review.date}</span>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
