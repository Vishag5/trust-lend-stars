-- Migration: example_migration
-- Created: 2025-01-06T12:00:00.000Z
-- Description: Example migration template

-- This is an example migration file
-- Replace this content with your actual SQL changes

-- Example: Adding a new column
-- ALTER TABLE public.users ADD COLUMN preferences JSONB;

-- Example: Creating a new table
-- CREATE TABLE public.user_preferences (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
--   preferences JSONB NOT NULL DEFAULT '{}',
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- Remember to:
-- 1. Test your changes in Supabase Dashboard first
-- 2. Add proper comments
-- 3. Consider rollback scenarios
-- 4. Update any affected RLS policies if needed
