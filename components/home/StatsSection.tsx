import { Users, Package, Star, Download } from 'lucide-react';

const stats = [
  { icon: Users, value: '2.5M+', label: 'Active Players', color: 'text-cyan-400' },
  { icon: Package, value: '10K+', label: 'Games Available', color: 'text-blue-400' },
  { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'text-amber-400' },
  { icon: Download, value: '50M+', label: 'Downloads', color: 'text-green-400' },
];

export default function StatsSection() {
  return (
    <section className="py-12 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-4 justify-center lg:justify-start">
              <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
