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

export type LandingPage = {
  id: string;
  slug: string;
  product_id: string | null;
  title: string;
  is_published: boolean;
  seo_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  facebook_pixel: string | null;
  google_analytics: string | null;
  google_tag_manager: string | null;
  tiktok_pixel: string | null;
  custom_header_script: string | null;
  custom_footer_script: string | null;
  views: number;
  orders_count: number;
  incomplete_orders_count: number;
  revenue: number;
  created_at: string;
  updated_at: string;
};

export type LandingPageSection = {
  id: string;
  landing_page_id: string;
  section_type: string;
  title: string | null;
  is_enabled: boolean;
  sort_order: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type LandingVisitor = {
  id: string;
  session_id: string;
  landing_page_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  ip: string | null;
  landed_at: string;
  left_at: string | null;
  is_bounced: boolean;
  created_at: string;
};

export type DraftOrder = {
  id: string;
  visitor_id: string | null;
  landing_page_id: string | null;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_district: string | null;
  customer_area: string | null;
  customer_address: string | null;
  customer_notes: string | null;
  unit_price: number;
  total: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  referrer: string | null;
  status: string;
  recovery_status: string;
  assigned_staff: string | null;
  last_activity_at: string;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadActivity = {
  id: string;
  visitor_id: string;
  draft_order_id: string | null;
  activity_type: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type RecoveryNote = {
  id: string;
  draft_order_id: string;
  note_type: string;
  content: string;
  author: string | null;
  created_at: string;
};
