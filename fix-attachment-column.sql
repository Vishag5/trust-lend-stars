-- Fix attachment_url column issue
-- Run this in Supabase SQL Editor

-- Check if attachment_url column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'contracts' 
  AND table_schema = 'public' 
  AND column_name = 'attachment_url';

-- Add attachment_url column if it doesn't exist
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contracts' 
  AND table_schema = 'public' 
  AND column_name IN ('attachment_url', 'disbursal_proof_url', 'repayment_proof_url')
ORDER BY column_name;
