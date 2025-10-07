-- Add attachment_url column to contracts table
ALTER TABLE public.contracts
ADD COLUMN attachment_url TEXT;
