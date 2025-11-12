-- Add missing foreign key constraint for reviewed_user_id in reviews table
-- This ensures data integrity between reviews and users table

-- Note: This assumes the column has already been renamed from reviewee_id to reviewed_user_id
-- in previous migrations

-- Add the foreign key constraint to link reviewed_user_id to users.id
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_reviewed_user_id_fkey 
FOREIGN KEY (reviewed_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Verify the constraint was added
SELECT conname, confrelid::regclass, conrelid::regclass, conkey, confkey
FROM pg_constraint 
WHERE conrelid = 'public.reviews'::regclass
AND conname = 'reviews_reviewed_user_id_fkey';