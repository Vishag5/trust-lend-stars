-- Add missing columns and update status enum for contracts table
-- This migration adds the settlement_pending column and updates the status enum to match application code

-- Add settlement_pending column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS settlement_pending BOOLEAN DEFAULT false;

-- Add repayment_proof_url column if it doesn't exist (it might be missing too)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS repayment_proof_url TEXT;

-- Add disbursal_proof_url column if it doesn't exist (in case it's also missing)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS disbursal_proof_url TEXT;

-- Add attachment_url column if it doesn't exist (in case it's also missing)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Update the status column check constraint to include all required values
-- First drop the existing constraint
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Add the new check constraint with all required status values
ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('REQUESTED', 'PENDING_DISBURSAL', 'ACTIVE', 'DUE', 'PENDING_SETTLEMENT', 'SETTLED', 'REJECTED', 'SETTLE_PENDING'));

-- Update any existing 'SETTLE_PENDING' records to 'PENDING_SETTLEMENT' to match the application code
UPDATE public.contracts 
SET status = 'PENDING_SETTLEMENT' 
WHERE status = 'SETTLE_PENDING';

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Add trigger for contracts if it doesn't exist
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();