# Supabase Migrations

This directory contains database migrations for the Trust Lend Stars application.

## Migration Workflow

### When you make schema changes:

1. **Create a new migration file:**
   ```bash
   # Create a new migration with timestamp
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_migration_name.sql
   ```

2. **Write your SQL changes in the migration file**

3. **Test the migration:**
   - Apply to your local Supabase instance (if you have one)
   - Or apply directly to your remote project via Supabase Dashboard

4. **Commit to Git:**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add [description of changes]"
   git push origin main
   ```

## Current Migrations

- `20251001072519_6c168597-f47e-4983-b9b4-04596e1f0b1d.sql` - Initial schema (users, contracts, extensions, reviews, reminders)
- `20250106000000_add_email_column.sql` - Add email column to users table
- `20251001072612_1e212f3e-8165-4ccf-bcc4-22f1ca19868f.sql` - Additional migration

## Applying Migrations

### To your remote Supabase project:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/leuqcbemxfdeuyjzfvcr
2. Open SQL Editor
3. Copy and paste the migration SQL
4. Run the migration

### To commit changes:
```bash
git add supabase/migrations/
git commit -m "feat: update database schema - [description]"
git push origin main
```
