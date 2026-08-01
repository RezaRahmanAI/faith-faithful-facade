import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  price: number;
  old_price: number;
  image: string | null;
  gallery: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviews: number;
  sku: string | null;
  description: string | null;
  details: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  items: Array<{
    slug: string;
    name: string;
    size: string;
    color: string;
    qty: number;
    price: number;
  }>;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
};
