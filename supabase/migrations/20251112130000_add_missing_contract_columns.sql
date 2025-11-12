-- Add missing columns to contracts table for ITEM and SERVICE contracts
-- These columns are expected by the application Contract interface but missing from database

-- Add contract_type column
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'MONEY' 
CHECK (contract_type IN ('MONEY', 'ITEM', 'SERVICE'));

-- Add ITEM-specific columns
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS item_title TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS item_estimated_value NUMERIC;

-- item_condition_photos is an array of strings, using TEXT for now (can store JSON)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS item_condition_photos TEXT;

-- Add SERVICE-specific columns
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS service_description TEXT;

-- service_milestones is complex object, storing as JSON
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS service_milestones JSONB;

-- Add legal upgrade column (storing as JSON)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS legal_upgrade JSONB;

-- Add extensions_count column if missing
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS extensions_count INTEGER DEFAULT 0;

-- Add extension_pending column if missing
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS extension_pending BOOLEAN DEFAULT false;