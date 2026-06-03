'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, ShoppingBag, BarChart3,
  TrendingUp, DollarSign, Star, Plus, Edit, Trash2, Search,
  ArrowUp, ArrowDown, Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { Game, Order } from '@/types/database';
import Link from 'next/link';

const adminTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'games', label: 'Games', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const mockRevenueData = [
  { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5800 }, { month: 'Mar', revenue: 7200 },
  { month: 'Apr', revenue: 6100 }, { month: 'May', revenue: 8900 }, { month: 'Jun', revenue: 11200 },
  { month: 'Jul', revenue: 9800 }, { month: 'Aug', revenue: 12400 }, { month: 'Sep', revenue: 10200 },
  { month: 'Oct', revenue: 15600 }, { month: 'Nov', revenue: 18200 }, { month: 'Dec', revenue: 22400 },
];

const mockSalesData = [
  { name: 'Cyber Nexus', sales: 423 }, { name: 'Mind Labyrinth', sales: 387 },
  { name: "Dragon's Lair", sales: 312 }, { name: 'Phantom Horror', sales: 289 },
  { name: 'Velocity Strike', sales: 245 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [games, setGames] = useState<Game[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Revenue', value: '$142,580', change: '+18.2%', up: true, icon: DollarSign, color: 'text-green-400 bg-green-400/10' },
    { label: 'Total Orders', value: '2,847', change: '+12.5%', up: true, icon: ShoppingBag, color: 'text-blue-400 bg-blue-400/10' },
    { label: 'Active Users', value: '18,421', change: '+7.3%', up: true, icon: Users, color: 'text-cyan-400 bg-cyan-400/10' },
    { label: 'Games Listed', value: String(games.length), change: '+3', up: true, icon: Package, color: 'text-amber-400 bg-amber-400/10' },
  ];

  useEffect(() => {
    if (!isLoading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoading, user, profile, router]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      setGamesLoading(true);
      supabase.from('games').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        setGames(data || []);
        setGamesLoading(false);
      });
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20).then(({ data }) => {
        setOrders(data || []);
      });
    }
  }, [user, profile]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#050508] flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>;
  }

  if (!user || profile?.role !== 'admin') return null;

  const filteredGames = games.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.developer || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050508] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome back, {profile?.display_name || 'Admin'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
              {adminTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm transition-all',
                    activeTab === tab.id
                      ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/3'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map(stat => (
                    <div key={stat.label} className="p-5 bg-[#12121a] border border-white/10 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.color)}>
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <span className={cn('text-xs font-semibold flex items-center gap-0.5', stat.up ? 'text-green-400' : 'text-red-400')}>
                          {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Revenue Chart */}
                <div className="p-5 bg-[#12121a] border border-white/10 rounded-xl">
                  <h3 className="text-base font-bold text-white mb-4">Monthly Revenue</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Games */}
                <div className="p-5 bg-[#12121a] border border-white/10 rounded-xl">
                  <h3 className="text-base font-bold text-white mb-4">Top Selling Games</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={mockSalesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="sales" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search games..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all">
                    <Plus className="w-4 h-4" /> Add Game
                  </button>
                </div>

                <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Game</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden md:table-cell">Price</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden lg:table-cell">Rating</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Status</th>
                        <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGames.map((game, i) => (
                        <tr key={game.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 === 0 && 'bg-white/[0.01]')}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={game.cover_image || ''} alt={game.title} className="w-10 h-7 object-cover rounded-lg" />
                              <div>
                                <p className="text-sm font-medium text-white line-clamp-1">{game.title}</p>
                                <p className="text-xs text-gray-500">{game.developer}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-white">${game.price.toFixed(2)}</span>
                            {game.discount_percent ? <span className="ml-1.5 text-xs text-green-400">-{game.discount_percent}%</span> : null}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-sm text-white">{(game.rating || 0).toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', game.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                              {game.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/game/${game.slug}`} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button className="p-1.5 text-gray-400 hover:text-cyan-400 transition-colors">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredGames.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">No games found</div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
                <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Order ID</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden md:table-cell">Date</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Status</th>
                        <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, i) => (
                        <tr key={order.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 === 0 && 'bg-white/[0.01]')}>
                          <td className="px-4 py-3 text-sm font-mono text-gray-300">#{order.id.slice(0, 8).toUpperCase()}</td>
                          <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{new Date(order.created_at!).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                              order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            )}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-white text-right">${order.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-[#12121a] border border-white/10 rounded-xl">
                    <h3 className="text-base font-bold text-white mb-4">Revenue by Month</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={mockRevenueData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                        <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-5 bg-[#12121a] border border-white/10 rounded-xl">
                    <h3 className="text-base font-bold text-white mb-4">Sales Growth</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="p-6 bg-[#12121a] border border-white/10 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
                <p className="text-gray-400 text-sm">User management features are available. Connect to the profiles table to manage users.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
