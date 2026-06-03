'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, LogOut, Package, BarChart3, Settings, ShoppingBag, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Game, Category } from '@/types/database';

const tabs = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface GameWithCategory extends Game {
  categories?: Category | null;
}

interface OrderItem {
  id: string;
  game_title: string;
  game_cover: string;
  price: number;
  quantity: number;
  games?: Game;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  profiles?: {
    email: string;
    display_name: string;
  };
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [games, setGames] = useState<GameWithCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGame, setEditingGame] = useState<GameWithCategory | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('ownerToken');
    if (!token) {
      router.push('/owner/login');
      return;
    }
    loadProducts();
    if (activeTab === 'orders') loadOrders();
  }, [router, activeTab]);

  const loadProducts = async () => {
    const token = localStorage.getItem('ownerToken');
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/owner/products', {
        headers: { authorization: token },
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('ownerToken');
          router.push('/owner/login');
        }
        throw new Error(data.error);
      }
      setGames(data.games || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    const token = localStorage.getItem('ownerToken');
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/owner/orders', {
        headers: { authorization: token },
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('ownerToken');
          router.push('/owner/login');
        }
        throw new Error(data.error);
      }
      setOrders(data.orders || []);
      calculateAnalytics(data.orders || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = (orderList: Order[]) => {
    const totalRevenue = orderList.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = orderList.filter(o => o.status === 'completed').length;
    const totalOrders = orderList.length;
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by status
    const statusData = [
      { name: 'Completed', value: completedOrders, fill: '#10b981' },
      { name: 'Pending', value: orderList.filter(o => o.status === 'pending').length, fill: '#f59e0b' },
      { name: 'Processing', value: orderList.filter(o => o.status === 'processing').length, fill: '#3b82f6' },
      { name: 'Cancelled', value: orderList.filter(o => o.status === 'cancelled').length, fill: '#ef4444' },
    ].filter(s => s.value > 0);

    // Daily revenue (last 7 days)
    const dailyData: { [key: string]: number } = {};
    orderList.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[date] = (dailyData[date] || 0) + order.total;
    });

    const revenueData = Object.entries(dailyData)
      .slice(-7)
      .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }));

    setAnalyticsData({
      totalRevenue,
      completedOrders,
      totalOrders,
      averageOrder,
      statusData,
      revenueData,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('ownerEmail');
    toast.success('Logged out');
    router.push('/');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('ownerToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/owner/products/${id}`, {
        method: 'DELETE',
        headers: { authorization: token },
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredGames = games.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.developer || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050508] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Store Owner Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage your game marketplace</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-400 hover:bg-red-500/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
              {tabs.map(tab => (
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
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <button
                    onClick={() => { setShowCreateForm(true); setEditingGame(null); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                ) : showCreateForm || editingGame ? (
                  <ProductForm
                    game={editingGame}
                    onClose={() => { setShowCreateForm(false); setEditingGame(null); }}
                    onSave={() => { loadProducts(); setShowCreateForm(false); setEditingGame(null); }}
                  />
                ) : (
                  <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Game</th>
                          <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden md:table-cell">Price</th>
                          <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden lg:table-cell">Status</th>
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
                              {game.discount_percent ? <span className="ml-2 text-xs text-green-400">-{game.discount_percent}%</span> : null}
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', game.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                                {game.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/game/${game.slug}`} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                                <button onClick={() => setEditingGame(game)} className="p-1.5 text-gray-400 hover:text-cyan-400 transition-colors">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(game.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredGames.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        No products found. Create your first product!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Order ID</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Customer</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden md:table-cell">Items</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden lg:table-cell">Total</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Status</th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden sm:table-cell">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, i) => (
                            <tr key={order.id} className={cn('border-b border-white/5 hover:bg-white/2 transition-colors', i % 2 === 0 && 'bg-white/[0.01]')}>
                              <td className="px-4 py-3">
                                <span className="text-sm font-mono text-cyan-400">{order.id.substring(0, 8)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm text-white">{order.profiles?.display_name || 'Anonymous'}</p>
                                  <p className="text-xs text-gray-500">{order.profiles?.email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <span className="text-sm text-gray-400">{order.order_items?.length} {order.order_items?.length === 1 ? 'item' : 'items'}</span>
                              </td>
                              <td className="px-4 py-3 hidden lg:table-cell">
                                <span className="text-sm font-semibold text-white">${order.total.toFixed(2)}</span>
                                {order.discount_amount > 0 && <span className="ml-2 text-xs text-green-400">-${order.discount_amount.toFixed(2)}</span>}
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
                                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                  'bg-blue-500/20 text-blue-400'
                                )}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <span className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {orders.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                          No orders yet. Customers will see their purchases here.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Sales Analytics</h2>

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">${analyticsData?.totalRevenue.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-cyan-400">{analyticsData?.totalOrders || 0}</p>
                      </div>
                      <div className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Completed Orders</p>
                        <p className="text-2xl font-bold text-green-400">{analyticsData?.completedOrders || 0}</p>
                      </div>
                      <div className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Avg Order Value</p>
                        <p className="text-2xl font-bold text-white">${analyticsData?.averageOrder.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Revenue Trend */}
                      <div className="p-6 bg-[#12121a] border border-white/10 rounded-xl">
                        <h3 className="text-sm font-semibold text-white mb-4">Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analyticsData?.revenueData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Order Status Distribution */}
                      <div className="p-6 bg-[#12121a] border border-white/10 rounded-xl">
                        <h3 className="text-sm font-semibold text-white mb-4">Order Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie data={analyticsData?.statusData || []} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                              {analyticsData?.statusData?.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-6 bg-[#12121a] border border-white/10 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">Store Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Account Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 uppercase font-semibold">Email</label>
                        <p className="text-white mt-1">{localStorage.getItem('ownerEmail')}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase font-semibold">Role</label>
                        <p className="text-white mt-1">Store Owner</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-semibold text-white mb-3">Store Information</h3>
                    <div className="space-y-3 text-sm text-gray-400">
                      <p>Manage your marketplace settings and preferences here.</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Total Products: {games.length}</li>
                        <li>Total Orders: {orders.length}</li>
                        <li>Total Revenue: ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-semibold text-white mb-3">About NexusStore</h3>
                    <p className="text-sm text-gray-400">
                      You are managing a premium game marketplace platform built with modern technologies including Next.js, Supabase, and React.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductForm({
  game,
  onClose,
  onSave,
}: {
  game: GameWithCategory | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: game?.title || '',
    slug: game?.slug || '',
    description: game?.description || '',
    short_description: game?.short_description || '',
    price: game?.price?.toString() || '',
    discount_percent: game?.discount_percent?.toString() || '0',
    developer: game?.developer || '',
    publisher: game?.publisher || '',
    cover_image: game?.cover_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    banner_image: game?.banner_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    is_featured: game?.is_featured || false,
    is_trending: game?.is_trending || false,
    is_new_release: game?.is_new_release || false,
    is_top_seller: game?.is_top_seller || false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast.error('Title and price are required');
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('ownerToken');
    if (!token) return;

    try {
      const method = game ? 'PATCH' : 'POST';
      const url = game ? `/api/owner/products/${game.id}` : '/api/owner/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(game ? 'Product updated' : 'Product created');
      onSave();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-[#12121a] border border-white/10 rounded-xl mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{game ? 'Edit Product' : 'Create New Product'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Game title"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="url-slug"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Price *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              placeholder="59.99"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount_percent}
              onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Developer</label>
            <input
              type="text"
              value={formData.developer}
              onChange={e => setFormData({ ...formData, developer: e.target.value })}
              placeholder="Developer name"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Publisher</label>
            <input
              type="text"
              value={formData.publisher}
              onChange={e => setFormData({ ...formData, publisher: e.target.value })}
              placeholder="Publisher name"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Short Description</label>
          <input
            type="text"
            value={formData.short_description}
            onChange={e => setFormData({ ...formData, short_description: e.target.value })}
            placeholder="Brief description"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Full Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Full game description"
            rows={3}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded border-white/20 bg-white/5 text-cyan-500"
            />
            <span className="text-sm text-gray-400">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_trending}
              onChange={e => setFormData({ ...formData, is_trending: e.target.checked })}
              className="rounded border-white/20 bg-white/5 text-cyan-500"
            />
            <span className="text-sm text-gray-400">Trending</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_new_release}
              onChange={e => setFormData({ ...formData, is_new_release: e.target.checked })}
              className="rounded border-white/20 bg-white/5 text-cyan-500"
            />
            <span className="text-sm text-gray-400">New Release</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_top_seller}
              onChange={e => setFormData({ ...formData, is_top_seller: e.target.checked })}
              className="rounded border-white/20 bg-white/5 text-cyan-500"
            />
            <span className="text-sm text-gray-400">Top Seller</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : game ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
