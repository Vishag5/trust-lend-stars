# Database Migration Guide - LenTrust Contract Types

## Issue: `reviewed_user_id` Column Not Found

**Error**: `column reviews.reviewed_user_id does not exist`

**Root Cause**: The database schema uses `reviewee_id` but the code is querying for `reviewed_user_id`.

**Database Schema** (correct):
```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY,
  contract_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,  -- Person giving the review
  reviewee_id UUID NOT NULL,  -- Person being reviewed ✓ CORRECT
  stars INTEGER NOT NULL,
  text TEXT,
  created_at TIMESTAMPTZ
);
```

**Code is using**: `reviewed_user_id` ❌ (incorrect)

---

## Solution: Apply Migration + Fix Code

### Step 1: Run the Migration

```bash
cd /home/dell/Downloads/trust-lend-stars

# Link to your Supabase project (if not already linked)
npx supabase@latest link --project-ref leuqcbemxfdeuyjzfvcr

# Apply the migration
npx supabase@latest db push
```

Or manually via Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/leuqcbemxfdeuyjzfvcr/sql
2. Copy contents of `supabase/migrations/20250112000000_add_contract_types_support.sql`
3. Paste and run

### Step 2: Fix Code References

The database column is `reviewee_id` (correct). Update any code using `reviewed_user_id`:

**Files to check**:
- `src/lib/dataClient.ts` - Update API queries
- `src/components/ContractCard.tsx` - Line 117 uses correct `reviewed_user_id` parameter name, but the database query needs to use `reviewee_id`

---

## Migration Details

### What the Migration Does:

1. **Adds Contract Type Support**
   - Adds `contract_type` column (MONEY, ITEM, SERVICE)
   - Backfills existing contracts as 'MONEY'
   - Adds item-specific columns (title, value, photos)
   - Adds service-specific columns (description, milestones)
   - Adds legal upgrade support

2. **Fixes Status Constraint**
   - Adds missing statuses: `PENDING_DISBURSAL`, `DUE`, `REJECTED`
   - Previous constraint only had: REQUESTED, ACTIVE, SETTLE_PENDING, SETTLED

3. **Relaxes Amount Constraint**
   - MONEY contracts: amount >= 100 (unchanged)
   - ITEM/SERVICE contracts: amount >= 0 (can be zero)

4. **Adds Missing Columns**
   - `extensions.reason` for extension explanations
   - `users.email` for notifications

5. **Creates Indexes**
   - Faster queries on contract_type, status, borrower_id, lender_id
   - Faster review lookups by reviewee_id, reviewer_id

6. **Analytics View**
   - Creates `contract_stats` view for dashboard analytics

---

## Verification Steps

After running the migration:

### 1. Check Contract Type Column
```sql
SELECT contract_type, COUNT(*) 
FROM contracts 
GROUP BY contract_type;
```

Expected: All existing contracts should show `MONEY`

### 2. Check Status Constraint
```sql
-- This should now work (previously would fail)
INSERT INTO contracts (borrower_id, lender_id, amount, due_at, status, contract_type)
VALUES ('uuid1', 'uuid2', 1000, NOW() + interval '7 days', 'PENDING_DISBURSAL', 'MONEY');
```

### 3. Check Reviews Table
```sql
-- Use the correct column name
SELECT * FROM reviews WHERE reviewee_id = 'f8ea71df-f2c7-4683-b8d6-df45a2be9261';
```

This should work now (your original query used `reviewed_user_id` which doesn't exist).

---

## Code Changes Needed

### dataClient.ts - Fix Review Queries

Find and update any queries like this:

**Before** (incorrect):
```typescript
const { data } = await supabase
  .from('reviews')
  .select('*')
  .eq('reviewed_user_id', userId);  // ❌ Wrong column name
```

**After** (correct):
```typescript
const { data } = await supabase
  .from('reviews')
  .select('*')
  .eq('reviewee_id', userId);  // ✓ Correct column name
```

### ContractCard.tsx - Already Using Correct Param

The code at line 117 is fine:
```typescript
reviewed_user_id: contract.borrower_id,
```

This is the **parameter name** for the `createReview` function, which internally should map to `reviewee_id` in the database.

---

## Quick Fix for Immediate Testing

If you can't run the migration immediately, you can test with a quick SQL patch:

```sql
-- Add contract_type with default
ALTER TABLE public.contracts 
ADD COLUMN contract_type TEXT DEFAULT 'MONEY';

-- Update status constraint
ALTER TABLE public.contracts 
DROP CONSTRAINT contracts_status_check;

ALTER TABLE public.contracts 
ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('REQUESTED', 'PENDING_DISBURSAL', 'ACTIVE', 'DUE', 'PENDING_SETTLEMENT', 'SETTLED', 'REJECTED'));
```

Then use the correct column name in queries:
```
reviewee_id (not reviewed_user_id)
```

---

## Testing the New Contract Types

After migration, you can test:

### Create ITEM Contract
```sql
INSERT INTO contracts (
  borrower_id, lender_id, amount, due_at, status, contract_type,
  item_title, item_estimated_value, item_condition_photos
) VALUES (
  'borrower_uuid', 'lender_uuid', 50000, NOW() + interval '7 days', 
  'REQUESTED', 'ITEM', 'Laptop', 50000, '["data:image/png;base64,..."]'::jsonb
);
```

### Create SERVICE Contract
```sql
INSERT INTO contracts (
  borrower_id, lender_id, amount, due_at, status, contract_type,
  service_description, service_milestones
) VALUES (
  'provider_uuid', 'client_uuid', 20000, NOW() + interval '30 days',
  'REQUESTED', 'SERVICE', 'Website Design',
  '[
    {"id":"1","title":"Mockups","due_at":"2025-01-20T10:00:00Z","amount":5000,"proof_url":null,"approved":null},
    {"id":"2","title":"Development","due_at":"2025-02-10T10:00:00Z","amount":10000,"proof_url":null,"approved":null}
  ]'::jsonb
);
```

---

## Common Issues & Solutions

### Issue: "constraint contracts_status_check is violated"
**Solution**: Run Step 4 of the migration to update status constraint

### Issue: "column contract_type does not exist"
**Solution**: Run Step 1 of the migration to add the column

### Issue: "column reviews.reviewed_user_id does not exist"
**Solution**: Use `reviewee_id` instead in all database queries

### Issue: "amount must be >= 100" for ITEM contracts
**Solution**: Run Step 5 of the migration to relax amount constraint

---

## Rollback Plan (if needed)

```sql
-- Remove new columns (this will lose data!)
ALTER TABLE public.contracts
  DROP COLUMN IF EXISTS contract_type,
  DROP COLUMN IF EXISTS item_title,
  DROP COLUMN IF EXISTS item_estimated_value,
  DROP COLUMN IF EXISTS item_condition_photos,
  DROP COLUMN IF EXISTS service_description,
  DROP COLUMN IF EXISTS service_milestones,
  DROP COLUMN IF EXISTS legal_upgrade;

-- Restore original status constraint
ALTER TABLE public.contracts DROP CONSTRAINT contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check 
  CHECK (status IN ('REQUESTED', 'ACTIVE', 'SETTLE_PENDING', 'SETTLED'));

-- Restore original amount constraint  
ALTER TABLE public.contracts DROP CONSTRAINT contracts_amount_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_amount_check CHECK (amount >= 100);
```

---

## Next Steps

1. ✅ Apply migration via Supabase CLI or Dashboard
2. ✅ Verify column names match between code and database
3. ✅ Test creating MONEY, ITEM, and SERVICE contracts
4. ✅ Update seed data to include contract_type
5. ✅ Test review creation with correct `reviewee_id` column

**Support**: If issues persist, check the Supabase dashboard logs and verify RLS policies allow the operations.
