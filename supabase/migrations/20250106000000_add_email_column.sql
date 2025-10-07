-- Add email column to users table
ALTER TABLE public.users ADD COLUMN email TEXT UNIQUE;

-- Update the RLS policies to include email
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert themselves" ON public.users;
DROP POLICY IF EXISTS "Users can update themselves" ON public.users;

-- Recreate RLS policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themselves" ON public.users FOR UPDATE USING (true);
