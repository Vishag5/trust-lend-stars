-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  trust_reliability_cached NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 100),
  due_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status TEXT NOT NULL CHECK (status IN ('REQUESTED', 'ACTIVE', 'SETTLE_PENDING', 'SETTLED')),
  disbursal_proof_url TEXT,
  repayment_proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create extensions table
CREATE TABLE public.extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  new_due_at TIMESTAMPTZ NOT NULL,
  approved BOOLEAN,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  text TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themselves" ON public.users FOR UPDATE USING (true);

-- RLS Policies for contracts (borrower or lender can access)
CREATE POLICY "Users can view their contracts" ON public.contracts 
  FOR SELECT USING (borrower_id IN (SELECT id FROM public.users) OR lender_id IN (SELECT id FROM public.users));
CREATE POLICY "Users can create contracts" ON public.contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their contracts" ON public.contracts 
  FOR UPDATE USING (borrower_id IN (SELECT id FROM public.users) OR lender_id IN (SELECT id FROM public.users));

-- RLS Policies for extensions
CREATE POLICY "Users can view extensions for their contracts" ON public.extensions 
  FOR SELECT USING (contract_id IN (SELECT id FROM public.contracts));
CREATE POLICY "Users can create extensions" ON public.extensions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update extensions" ON public.extensions 
  FOR UPDATE USING (contract_id IN (SELECT id FROM public.contracts));

-- RLS Policies for reviews
CREATE POLICY "Users can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update reviews" ON public.reviews FOR UPDATE USING (true);

-- RLS Policies for reminders
CREATE POLICY "Users can view reminders for their contracts" ON public.reminders 
  FOR SELECT USING (contract_id IN (SELECT id FROM public.contracts));
CREATE POLICY "Users can create reminders" ON public.reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update reminders" ON public.reminders 
  FOR UPDATE USING (contract_id IN (SELECT id FROM public.contracts));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for contracts
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();