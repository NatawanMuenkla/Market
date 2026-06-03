'use client';

import { Mail, Zap, Gift, Shield } from 'lucide-react';

const features = [
  { icon: Zap, label: 'Instant Delivery', desc: 'Get your games instantly after purchase' },
  { icon: Shield, label: 'Secure Payments', desc: 'Your data is always safe with us' },
  { icon: Gift, label: 'Exclusive Deals', desc: 'Members-only offers and discounts' },
];

export default function NewsletterSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-transparent border border-cyan-500/20 p-8 md:p-12">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-600/5 rounded-full translate-y-1/2 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-3">
                Get Exclusive Gaming Deals
              </h2>
              <p className="text-gray-400 mb-6 max-w-md">
                Subscribe to our newsletter and be the first to know about flash sales, new releases, and exclusive member discounts.
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                {features.map(f => (
                  <div key={f.label} className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <f.icon className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{f.label}</p>
                      <p className="text-xs text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form className="flex gap-3 max-w-md" onSubmit={e => e.preventDefault()}>
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:bg-white/8 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25 whitespace-nowrap"
                >
                  Subscribe Free
                </button>
              </form>

              <p className="text-xs text-gray-600 mt-3">No spam, ever. Unsubscribe at any time.</p>
            </div>

            <div className="hidden lg:block">
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl opacity-20 blur-2xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-black text-white mb-1">50K+</p>
                    <p className="text-sm text-cyan-400 font-medium">Happy Subscribers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
