/*
# Error Logging Table

1. New Tables
- `error_logs` — persists client-side and server-side errors for debugging and monitoring
  - `id` (uuid, primary key)
  - `error_type` (text) — classification: network, api, validation, runtime, auth, offline
  - `severity` (text) — error | warning | info
  - `message` (text) — user-friendly message
  - `stack` (text) — full stack trace if available
  - `route` (text) — URL where the error occurred
  - `user_agent` (text) — browser/device info
  - `metadata` (jsonb) — additional context (status codes, request body, etc.)
  - `is_resolved` (boolean) — for admin triage
  - `created_at` (timestamptz)

2. Security
- Single-tenant app. All policies use TO anon, authenticated with USING(true).
- The storefront needs to log errors as anon.

3. Indexes
- error_logs(created_at) for time-based queries
- error_logs(error_type) for filtering by category
- error_logs(is_resolved) for admin triage
*/

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL DEFAULT 'runtime',
  severity text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  route text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_error_logs" ON error_logs;
CREATE POLICY "anon_select_error_logs" ON error_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_error_logs" ON error_logs;
CREATE POLICY "anon_insert_error_logs" ON error_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_error_logs" ON error_logs;
CREATE POLICY "anon_update_error_logs" ON error_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_error_logs" ON error_logs;
CREATE POLICY "anon_delete_error_logs" ON error_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(is_resolved);
