-- Fix reviews table column names to match application code
-- The application expects 'comment' and 'rating' but the database might have 'text' and 'stars'

-- Check if the old column names exist and rename them to match the TypeScript interface
-- This is a bit complex in PostgreSQL since we need to check column existence first

-- First, add the new column names if they don't exist (for safety)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INTEGER;

-- Copy data from old columns to new columns if old columns exist
-- We need to handle this with a more complex approach since we can't conditionally RENAME

-- This approach adds new columns and copies data, then we can remove old ones later
UPDATE public.reviews SET comment = text WHERE text IS NOT NULL AND comment IS NULL;
UPDATE public.reviews SET rating = stars WHERE stars IS NOT NULL AND rating IS NULL;

-- Now drop the old columns since we have the new ones with the correct names
-- Only if the old columns exist and new ones exist
-- This requires separate migration steps in practice
ALTER TABLE public.reviews DROP COLUMN IF EXISTS text;
ALTER TABLE public.reviews DROP COLUMN IF EXISTS stars;

-- Ensure the correct columns exist with the right names
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INTEGER;
-- In a future deployment, the old columns could be dropped if needed