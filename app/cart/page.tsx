'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Game, Coupon } from '@/types/database';

interface CartItem {
  id: string;
  game_id: string;
  quantity: number;
  games: Game | null;
}

export default function CartPage() {
  const { user, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percent' | 'fixed' } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) window.location.href = '/auth/login';
  }, [isLoading, user]);

  useEffect(() => {
    if (user) loadCart();
  }, [user]);

  const loadCart = async () => {
    setIsLoadingCart(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, games(*)')
      .eq('user_id', user?.id || '')
      .order('created_at');

    if (error) {
      toast.error('Failed to load cart');
    } else {
      setCartItems((data as CartItem[]) || []);
    }
    setIsLoadingCart(false);
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (error) {
      toast.error('Failed to remove item');
    } else {
      setCartItems(cartItems.filter(i => i.id !== itemId));
      toast.success('Item removed');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    const cartTable = supabase.from('cart_items') as any;
    const { error } = await cartTable
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to update quantity');
    } else {
      setCartItems(cartItems.map(i => (i.id === itemId ? { ...i, quantity } : i)));
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');

    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle() as { data: Coupon | null };

    if (!data) {
      setCouponError('Invalid or expired coupon code');
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('This coupon has expired');
    } else if (data.max_uses && (data.used_count || 0) >= data.max_uses) {
      setCouponError('This coupon has reached its usage limit');
    } else {
      setAppliedCoupon({ code: data.code, discount: data.discount_value, type: data.discount_type as 'percent' | 'fixed' });
      toast.success(`Coupon "${data.code}" applied!`);
    }
    setIsApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const cartTotal = cartItems.reduce((acc, item) => {
    if (!item.games) return acc;
    const price = item.games.price * (1 - (item.games.discount_percent || 0) / 100);
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? cartTotal * (appliedCoupon.discount / 100)
      : Math.min(appliedCoupon.discount, cartTotal)
    : 0;

  const finalTotal = Math.max(0, cartTotal - discountAmount);
  const tax = finalTotal * 0.08;
  const grandTotal = finalTotal + tax;

  const handleCheckout = async () => {
    if (!user) return;
    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          items: cartItems.map(i => i.games).filter(Boolean),
          couponCode: appliedCoupon?.code,
          subtotal: cartTotal,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Simulate payment - in production, integrate with Stripe
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          orderId: data.orderId,
          paymentStatus: 'succeeded',
        }),
      });

      if (!paymentResponse.ok) throw new Error('Payment failed');

      toast.success('Order placed successfully!');
      setCartItems([]);
      setAppliedCoupon(null);
      setTimeout(() => window.location.href = '/dashboard/orders', 1500);
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-[#050508] pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0 && !isLoadingCart) {
    return (
      <div className="min-h-screen bg-[#050508] pt-16 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Browse our store and find games you'll love.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
          >
            Browse Games
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={() => {
                setCartItems([]);
                supabase.from('cart_items').delete().eq('user_id', user?.id || '');
                toast.success('Cart cleared');
              }}
              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {isLoadingCart ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (
              cartItems.map(item => {
                if (!item.games) return null;
                const discount = item.games.discount_percent || 0;
                const price = item.games.price * (1 - discount / 100);
                return (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/3 border border-white/8 rounded-xl hover:border-white/15 transition-all">
                    <Link href={`/game/${item.games.slug}`} className="shrink-0">
                      <img
                        src={item.games.cover_image || 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg'}
                        alt={item.games.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/game/${item.games.slug}`} className="font-semibold text-white hover:text-cyan-400 transition-colors text-sm line-clamp-1">
                            {item.games.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">{item.games.developer}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors shrink-0 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg flex items-center justify-center text-white transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-white w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg flex items-center justify-center text-white transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          {discount > 0 && (
                            <p className="text-xs line-through text-gray-500">${(item.games.price * item.quantity).toFixed(2)}</p>
                          )}
                          <p className="text-sm font-bold text-white">${(price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="p-5 bg-[#12121a] border border-white/10 rounded-xl">
              <h2 className="text-base font-bold text-white mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal ({cartItems.length} items)</span>
                  <span className="text-white">${cartTotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Coupon Discount</span>
                    <span className="text-green-400">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax (8%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-black text-xl text-white">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">{appliedCoupon.code} applied</span>
                    </div>
                    <button onClick={removeCoupon} className="text-green-400/60 hover:text-green-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                          className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 uppercase"
                        />
                      </div>
                      <button
                        onClick={applyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
                    <p className="text-xs text-gray-600 mt-1">Try: WELCOME10, SAVE20, NEWUSER15</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Complete Order — ${grandTotal.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 text-center mt-3">
                Secure checkout. Your data is safe.
              </p>
            </div>

            <Link href="/marketplace" className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
