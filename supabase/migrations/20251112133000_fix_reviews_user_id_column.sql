-- Fix reviews table column name to match application code
-- The application expects 'reviewed_user_id' but the database has 'reviewee_id'

-- Add the column with the name expected by the application if it doesn't exist
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewed_user_id TEXT;

-- Copy data from old column name to new column name if old exists and new doesn't have data
UPDATE public.reviews 
SET reviewed_user_id = reviewee_id 
WHERE reviewed_user_id IS NULL AND reviewee_id IS NOT NULL;

-- Now drop the old column since we have the new one
ALTER TABLE public.reviews DROP COLUMN IF EXISTS reviewee_id;

-- Make sure reviewed_user_id is not null as expected by the application
-- (based on the TypeScript interface which doesn't mark it as optional)
ALTER TABLE public.reviews 
ALTER COLUMN reviewed_user_id SET NOT NULL;