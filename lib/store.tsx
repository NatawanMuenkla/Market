'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Game } from '@/types/database';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  game: Game;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  wishlist: Game[];
  isLoading: boolean;
  isSynced: boolean;
}

type StoreAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: { game: Game; quantity?: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { gameId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_WISHLIST'; payload: Game[] }
  | { type: 'ADD_TO_WISHLIST'; payload: Game }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCED'; payload: boolean };

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'ADD_TO_CART': {
      const exists = state.cart.find(item => item.game.id === action.payload.game.id);
      if (exists) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.game.id === action.payload.game.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          { id: action.payload.game.id, game: action.payload.game, quantity: action.payload.quantity || 1 },
        ],
      };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.game.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.game.id === action.payload.gameId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    case 'ADD_TO_WISHLIST': {
      const exists = state.wishlist.find(g => g.id === action.payload.id);
      if (exists) return state;
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    }
    case 'REMOVE_FROM_WISHLIST':
      return { ...state, wishlist: state.wishlist.filter(g => g.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SYNCED':
      return { ...state, isSynced: action.payload };
    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  addToCart: (game: Game, quantity?: number) => void;
  removeFromCart: (gameId: string) => void;
  updateQuantity: (gameId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (game: Game) => void;
  isInCart: (gameId: string) => boolean;
  isInWishlist: (gameId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  syncCart: () => Promise<void>;
  syncWishlist: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(storeReducer, {
    cart: [],
    wishlist: [],
    isLoading: false,
    isSynced: false,
  });

  // Sync cart and wishlist from database on mount and user change
  useEffect(() => {
    if (user) {
      syncCart();
      syncWishlist();
    }
  }, [user?.id]);

  const syncCart = async () => {
    if (!user) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, games(*)')
        .eq('user_id', user.id)
        .order('created_at');

      if (!error && data) {
        const cartItems = data.map((item: any) => ({
          id: item.id,
          game: item.games,
          quantity: item.quantity,
        }));
        dispatch({ type: 'SET_CART', payload: cartItems });
        dispatch({ type: 'SET_SYNCED', payload: true });
      }
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const syncWishlist = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*, games(*)')
        .eq('user_id', user.id);

      if (!error && data) {
        const games = data.map((item: any) => item.games).filter(Boolean);
        dispatch({ type: 'SET_WISHLIST', payload: games });
      }
    } catch (err) {
      console.error('Failed to sync wishlist:', err);
    }
  };

  const addToCart = async (game: Game, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { game, quantity } });
    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify({ gameId: game.id, quantity }),
        });
      } catch (err) {
        console.error('Failed to add to cart:', err);
      }
    }
  };

  const removeFromCart = async (gameId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: gameId });
    if (user) {
      const item = state.cart.find(i => i.game.id === gameId);
      if (item) {
        try {
          await fetch(`/api/cart?id=${item.id}`, { method: 'DELETE', headers: { 'x-user-id': user.id } });
        } catch (err) {
          console.error('Failed to remove from cart:', err);
        }
      }
    }
  };

  const updateQuantity = async (gameId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(gameId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { gameId, quantity } });
      if (user) {
        const item = state.cart.find(i => i.game.id === gameId);
        if (item) {
          try {
            const cartTable = supabase.from('cart_items') as any;
            await cartTable.update({ quantity }).eq('id', item.id);
          } catch (err) {
            console.error('Failed to update quantity:', err);
          }
        }
      }
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleWishlist = async (game: Game) => {
    const inWishlist = state.wishlist.find(g => g.id === game.id);
    if (inWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: game.id });
      if (user) {
        try {
          await fetch(`/api/wishlist?gameId=${game.id}`, {
            method: 'DELETE',
            headers: { 'x-user-id': user.id },
          });
        } catch (err) {
          console.error('Failed to remove from wishlist:', err);
        }
      }
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: game });
      if (user) {
        try {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
            body: JSON.stringify({ gameId: game.id }),
          });
        } catch (err) {
          console.error('Failed to add to wishlist:', err);
        }
      }
    }
  };

  const isInCart = (gameId: string) => state.cart.some(item => item.game.id === gameId);
  const isInWishlist = (gameId: string) => state.wishlist.some(g => g.id === gameId);

  const cartTotal = state.cart.reduce((acc, item) => {
    const price = item.game.price;
    const discount = item.game.discount_percent || 0;
    const finalPrice = price * (1 - discount / 100);
    return acc + finalPrice * item.quantity;
  }, 0);

  const cartCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{ state, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInCart, isInWishlist, cartTotal, cartCount, syncCart, syncWishlist }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
