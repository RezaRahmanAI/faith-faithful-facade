/*
# Landing Page Builder — Full Marketing Suite

1. New Tables
- `landing_pages` — one per product, SEO + pixel settings + publish state
- `landing_page_sections` — modular sections per landing page, ordered by sort_order
- `landing_visitors` — visitor sessions with campaign/device/location tracking
- `draft_orders` — auto-saved incomplete orders linked to visitor session + landing page
- `lead_activities` — timeline of visitor actions (visited, started form, saved draft, left, etc.)
- `recovery_notes` — internal notes + recovery actions on draft/incomplete orders
- `recovery_assignments` — assign sales executives to incomplete orders

2. Relationships
- landing_pages.product_id → products(id) ON DELETE SET NULL
- landing_page_sections.landing_page_id → landing_pages(id) ON DELETE CASCADE
- landing_visitors.landing_page_id → landing_pages(id) ON DELETE CASCADE
- draft_orders.landing_page_id → landing_pages(id) ON DELETE SET NULL
- draft_orders.visitor_id → landing_visitors(id) ON DELETE SET NULL
- lead_activities.visitor_id → landing_visitors(id) ON DELETE CASCADE
- lead_activities.draft_order_id → draft_orders(id) ON DELETE SET NULL
- recovery_notes.draft_order_id → draft_orders(id) ON DELETE CASCADE
- recovery_assignments.draft_order_id → draft_orders(id) ON DELETE CASCADE

3. Security
- Single-tenant app (no sign-in screen). All policies use TO anon, authenticated with USING(true).
- This is intentional: the storefront needs to create visitor sessions, save drafts, and log activities as anon.

4. Indexes
- landing_pages.slug (unique)
- landing_page_sections(landing_page_id, sort_order)
- landing_visitors.landing_page_id
- landing_visitors.session_id (unique)
- draft_orders.visitor_id
- draft_orders.status
- draft_orders.landing_page_id
- lead_activities.visitor_id
*/

-- ============ landing_pages ============
CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  title text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  seo_title text,
  meta_description text,
  og_image text,
  canonical_url text,
  facebook_pixel text,
  google_analytics text,
  google_tag_manager text,
  tiktok_pixel text,
  custom_header_script text,
  custom_footer_script text,
  views integer NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  incomplete_orders_count integer NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_landing_pages" ON landing_pages;
CREATE POLICY "anon_select_landing_pages" ON landing_pages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_landing_pages" ON landing_pages;
CREATE POLICY "anon_insert_landing_pages" ON landing_pages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_landing_pages" ON landing_pages;
CREATE POLICY "anon_update_landing_pages" ON landing_pages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_landing_pages" ON landing_pages;
CREATE POLICY "anon_delete_landing_pages" ON landing_pages FOR DELETE
  TO anon, authenticated USING (true);

-- ============ landing_page_sections ============
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  title text,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_landing_sections" ON landing_page_sections;
CREATE POLICY "anon_select_landing_sections" ON landing_page_sections FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_landing_sections" ON landing_page_sections;
CREATE POLICY "anon_insert_landing_sections" ON landing_page_sections FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_landing_sections" ON landing_page_sections;
CREATE POLICY "anon_update_landing_sections" ON landing_page_sections FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_landing_sections" ON landing_page_sections;
CREATE POLICY "anon_delete_landing_sections" ON landing_page_sections FOR DELETE
  TO anon, authenticated USING (true);

-- ============ landing_visitors ============
CREATE TABLE IF NOT EXISTS landing_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  landing_page_id uuid NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  referrer text,
  device text,
  browser text,
  os text,
  country text,
  ip text,
  landed_at timestamptz DEFAULT now(),
  left_at timestamptz,
  is_bounced boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE landing_visitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_visitors" ON landing_visitors;
CREATE POLICY "anon_select_visitors" ON landing_visitors FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_visitors" ON landing_visitors;
CREATE POLICY "anon_insert_visitors" ON landing_visitors FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_visitors" ON landing_visitors;
CREATE POLICY "anon_update_visitors" ON landing_visitors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_visitors" ON landing_visitors;
CREATE POLICY "anon_delete_visitors" ON landing_visitors FOR DELETE
  TO anon, authenticated USING (true);

-- ============ draft_orders ============
CREATE TABLE IF NOT EXISTS draft_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES landing_visitors(id) ON DELETE SET NULL,
  landing_page_id uuid REFERENCES landing_pages(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  quantity integer NOT NULL DEFAULT 1,
  customer_name text,
  customer_phone text,
  customer_district text,
  customer_area text,
  customer_address text,
  customer_notes text,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  referrer text,
  status text NOT NULL DEFAULT 'draft',
  recovery_status text NOT NULL DEFAULT 'pending',
  assigned_staff text,
  last_activity_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE draft_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_drafts" ON draft_orders;
CREATE POLICY "anon_select_drafts" ON draft_orders FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_drafts" ON draft_orders;
CREATE POLICY "anon_insert_drafts" ON draft_orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_drafts" ON draft_orders;
CREATE POLICY "anon_update_drafts" ON draft_orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_drafts" ON draft_orders;
CREATE POLICY "anon_delete_drafts" ON draft_orders FOR DELETE
  TO anon, authenticated USING (true);

-- ============ lead_activities ============
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid NOT NULL REFERENCES landing_visitors(id) ON DELETE CASCADE,
  draft_order_id uuid REFERENCES draft_orders(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_activities" ON lead_activities;
CREATE POLICY "anon_select_activities" ON lead_activities FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activities" ON lead_activities;
CREATE POLICY "anon_insert_activities" ON lead_activities FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_activities" ON lead_activities;
CREATE POLICY "anon_update_activities" ON lead_activities FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activities" ON lead_activities;
CREATE POLICY "anon_delete_activities" ON lead_activities FOR DELETE
  TO anon, authenticated USING (true);

-- ============ recovery_notes ============
CREATE TABLE IF NOT EXISTS recovery_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_order_id uuid NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  note_type text NOT NULL DEFAULT 'note',
  content text NOT NULL,
  author text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recovery_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_recovery_notes" ON recovery_notes;
CREATE POLICY "anon_select_recovery_notes" ON recovery_notes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_recovery_notes" ON recovery_notes;
CREATE POLICY "anon_insert_recovery_notes" ON recovery_notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_recovery_notes" ON recovery_notes;
CREATE POLICY "anon_update_recovery_notes" ON recovery_notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_recovery_notes" ON recovery_notes;
CREATE POLICY "anon_delete_recovery_notes" ON recovery_notes FOR DELETE
  TO anon, authenticated USING (true);

-- ============ recovery_assignments ============
CREATE TABLE IF NOT EXISTS recovery_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_order_id uuid NOT NULL REFERENCES draft_orders(id) ON DELETE CASCADE,
  staff_name text NOT NULL,
  assigned_at timestamptz DEFAULT now()
);

ALTER TABLE recovery_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_assignments" ON recovery_assignments;
CREATE POLICY "anon_select_assignments" ON recovery_assignments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_assignments" ON recovery_assignments;
CREATE POLICY "anon_insert_assignments" ON recovery_assignments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_assignments" ON recovery_assignments;
CREATE POLICY "anon_update_assignments" ON recovery_assignments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_assignments" ON recovery_assignments;
CREATE POLICY "anon_delete_assignments" ON recovery_assignments FOR DELETE
  TO anon, authenticated USING (true);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_lp_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_lps_landing_page_id ON landing_page_sections(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_lps_sort ON landing_page_sections(landing_page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lv_landing_page_id ON landing_visitors(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_lv_session_id ON landing_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_do_visitor_id ON draft_orders(visitor_id);
CREATE INDEX IF NOT EXISTS idx_do_status ON draft_orders(status);
CREATE INDEX IF NOT EXISTS idx_do_landing_page_id ON draft_orders(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_la_visitor_id ON lead_activities(visitor_id);
CREATE INDEX IF NOT EXISTS idx_rn_draft_order_id ON recovery_notes(draft_order_id);
CREATE INDEX IF NOT EXISTS idx_ra_draft_order_id ON recovery_assignments(draft_order_id);
