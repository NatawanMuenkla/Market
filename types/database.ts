export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: 'user' | 'admin';
          balance: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'user' | 'admin';
          balance?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: 'user' | 'admin';
          balance?: number | null;
          updated_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          cover_image: string | null;
          game_count: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          cover_image?: string | null;
          game_count?: number | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          cover_image?: string | null;
          game_count?: number | null;
        };
      };
      games: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          developer: string | null;
          publisher: string | null;
          price: number;
          discount_percent: number | null;
          cover_image: string | null;
          banner_image: string | null;
          trailer_url: string | null;
          category_id: string | null;
          platform: string[] | null;
          tags: string[] | null;
          rating: number | null;
          review_count: number | null;
          downloads: number | null;
          release_date: string | null;
          is_featured: boolean | null;
          is_trending: boolean | null;
          is_new_release: boolean | null;
          is_top_seller: boolean | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          developer?: string | null;
          publisher?: string | null;
          price: number;
          discount_percent?: number | null;
          cover_image?: string | null;
          banner_image?: string | null;
          trailer_url?: string | null;
          category_id?: string | null;
          platform?: string[] | null;
          tags?: string[] | null;
          rating?: number | null;
          review_count?: number | null;
          release_date?: string | null;
          is_featured?: boolean | null;
          is_trending?: boolean | null;
          is_new_release?: boolean | null;
          is_top_seller?: boolean | null;
          is_active?: boolean | null;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          developer?: string | null;
          publisher?: string | null;
          price?: number;
          discount_percent?: number | null;
          cover_image?: string | null;
          banner_image?: string | null;
          trailer_url?: string | null;
          category_id?: string | null;
          platform?: string[] | null;
          tags?: string[] | null;
          rating?: number | null;
          review_count?: number | null;
          is_featured?: boolean | null;
          is_trending?: boolean | null;
          is_new_release?: boolean | null;
          is_top_seller?: boolean | null;
          is_active?: boolean | null;
          updated_at?: string | null;
        };
      };
      game_screenshots: {
        Row: {
          id: string;
          game_id: string;
          url: string;
          caption: string | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          url: string;
          caption?: string | null;
          sort_order?: number | null;
        };
        Update: {
          url?: string;
          caption?: string | null;
          sort_order?: number | null;
        };
      };
      game_requirements: {
        Row: {
          id: string;
          game_id: string;
          type: 'minimum' | 'recommended';
          os: string | null;
          processor: string | null;
          memory: string | null;
          graphics: string | null;
          storage: string | null;
          directx: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          type: 'minimum' | 'recommended';
          os?: string | null;
          processor?: string | null;
          memory?: string | null;
          graphics?: string | null;
          storage?: string | null;
          directx?: string | null;
        };
        Update: {
          type?: 'minimum' | 'recommended';
          os?: string | null;
          processor?: string | null;
          memory?: string | null;
          graphics?: string | null;
          storage?: string | null;
          directx?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          body: string | null;
          is_verified_purchase: boolean | null;
          helpful_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          rating: number;
          title?: string | null;
          body?: string | null;
          is_verified_purchase?: boolean | null;
          helpful_count?: number | null;
        };
        Update: {
          rating?: number;
          title?: string | null;
          body?: string | null;
          helpful_count?: number | null;
          updated_at?: string | null;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
        };
        Update: Record<string, never>;
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          quantity: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          quantity?: number | null;
        };
        Update: {
          quantity?: number | null;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
          subtotal: number;
          discount_amount: number | null;
          total: number;
          coupon_id: string | null;
          coupon_code: string | null;
          payment_method: string | null;
          payment_intent_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
          subtotal: number;
          discount_amount?: number | null;
          total: number;
          coupon_id?: string | null;
          coupon_code?: string | null;
          payment_method?: string | null;
          payment_intent_id?: string | null;
        };
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
          discount_amount?: number | null;
          total?: number;
          coupon_id?: string | null;
          coupon_code?: string | null;
          payment_intent_id?: string | null;
          updated_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          game_id: string;
          game_title: string;
          game_cover: string | null;
          price: number;
          quantity: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          game_id: string;
          game_title: string;
          game_cover?: string | null;
          price: number;
          quantity?: number | null;
        };
        Update: {
          quantity?: number | null;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
          min_order_amount: number | null;
          max_uses: number | null;
          used_count: number | null;
          is_active: boolean | null;
          expires_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          is_active?: boolean | null;
          expires_at?: string | null;
        };
        Update: {
          discount_value?: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          used_count?: number | null;
          is_active?: boolean | null;
          expires_at?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          amount: number;
          currency: string | null;
          status: 'pending' | 'succeeded' | 'failed' | 'refunded';
          payment_method: string | null;
          stripe_payment_intent_id: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          amount: number;
          currency?: string | null;
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
          payment_method?: string | null;
          stripe_payment_intent_id?: string | null;
          metadata?: Json | null;
        };
        Update: {
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
          stripe_payment_intent_id?: string | null;
          metadata?: Json | null;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];
export type GameScreenshot = Database['public']['Tables']['game_screenshots']['Row'];
export type GameRequirement = Database['public']['Tables']['game_requirements']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Wishlist = Database['public']['Tables']['wishlists']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Coupon = Database['public']['Tables']['coupons']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];

export type GameWithCategory = Game & {
  categories: Category | null;
};

export type CartItemWithGame = CartItem & {
  games: Game | null;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & { games: Game | null })[];
};

export type ReviewWithProfile = Review & {
  profiles: Profile | null;
};
