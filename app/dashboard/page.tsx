'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Package, Heart, Download, Settings, LogOut, Edit,
  ShoppingBag, Star, Calendar, ChevronRight, Gamepad2
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Order, Game } from '@/types/database';
import GameCard from '@/components/GameCard';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'library', label: 'Library', icon: Download },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, signOut, updateProfile } = useAuth();
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      setOrdersLoading(true);
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setOrders(data || []);
          setOrdersLoading(false);
        });
    }
  }, [user, activeTab]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({ display_name: displayName, bio });
    if (!error) {
      toast.success('Profile updated');
      setEditMode(false);
    } else {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050508] pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="p-5 bg-[#12121a] border border-white/10 rounded-xl text-center">
              <Avatar className="w-16 h-16 border-2 border-cyan-500/30 mx-auto mb-3">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-cyan-400 text-xl font-bold">
                  {(profile?.display_name || user.email || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-white">{profile?.display_name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <div className="mt-3 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-xs text-cyan-400">Balance: <span className="font-bold">${(profile?.balance || 0).toFixed(2)}</span></p>
              </div>
            </div>

            {/* Nav */}
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
              <button
                onClick={async () => { await signOut(); router.push('/'); toast.success('Signed out'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6 bg-[#12121a] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">My Profile</h2>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-all">Cancel</button>
                      <button onClick={handleSaveProfile} disabled={isSaving} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Display Name</label>
                    {editMode ? (
                      <input
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                    ) : (
                      <p className="text-white font-medium">{profile?.display_name || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Email</label>
                    <p className="text-gray-300">{user.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Bio</label>
                    {editMode ? (
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none transition-all"
                        placeholder="Tell other gamers about yourself..."
                      />
                    ) : (
                      <p className="text-gray-300 text-sm leading-relaxed">{profile?.bio || 'No bio yet.'}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/3 rounded-xl">
                    <p className="text-2xl font-bold text-white">{orders.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-white/3 rounded-xl">
                    <p className="text-2xl font-bold text-white">{state.wishlist.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Wishlist Items</p>
                  </div>
                  <div className="text-center p-4 bg-white/3 rounded-xl">
                    <p className="text-2xl font-bold text-white">${(profile?.balance || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">Account Balance</p>
                  </div>
                </div>
              </div>
            )}

            {/* Library Tab */}
            {activeTab === 'library' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Game Library</h2>
                {state.wishlist.length === 0 ? (
                  <div className="text-center py-16 bg-[#12121a] border border-white/10 rounded-xl">
                    <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your library is empty.</p>
                    <Link href="/marketplace" className="inline-block mt-4 text-sm text-cyan-400 hover:text-cyan-300">Browse Games</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {state.wishlist.map(game => (
                      <GameCard key={game.id} game={game} variant="horizontal" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Order History</h2>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 bg-[#12121a] border border-white/10 rounded-xl">
                    <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No orders yet.</p>
                    <Link href="/marketplace" className="inline-block mt-4 text-sm text-cyan-400 hover:text-cyan-300">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-white">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{new Date(order.created_at!).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">${order.total.toFixed(2)}</p>
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            )}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Wishlist ({state.wishlist.length})</h2>
                {state.wishlist.length === 0 ? (
                  <div className="text-center py-16 bg-[#12121a] border border-white/10 rounded-xl">
                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your wishlist is empty.</p>
                    <Link href="/marketplace" className="inline-block mt-4 text-sm text-cyan-400 hover:text-cyan-300">Find Games You'll Love</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {state.wishlist.map(game => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-6 bg-[#12121a] border border-white/10 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/3 border border-white/8 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Email Address</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <span className="text-xs text-green-400 px-2 py-0.5 bg-green-500/10 rounded-full">Verified</span>
                  </div>
                  <div className="p-4 bg-white/3 border border-white/8 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Password</p>
                      <p className="text-xs text-gray-400">Change your account password</p>
                    </div>
                    <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg transition-all">
                      Change
                    </Link>
                  </div>
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <p className="text-sm font-semibold text-white mb-1">Danger Zone</p>
                    <p className="text-xs text-gray-400 mb-3">Once you delete your account, there is no going back.</p>
                    <button className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                      Delete Account
                    </button>
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
