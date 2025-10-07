#!/usr/bin/env node

/**
 * Create a new Supabase migration file
 * Usage: node scripts/create-migration.js "add_user_preferences_table"
 */

const fs = require('fs');
const path = require('path');

function createMigration() {
  const migrationName = process.argv[2];
  
  if (!migrationName) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: node scripts/create-migration.js "your_migration_name"');
    process.exit(1);
  }

  // Create timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  
  // Create filename
  const filename = `${timestamp}_${migrationName.replace(/[^a-zA-Z0-9]/g, '_')}.sql`;
  const filepath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  // Create migration template
  const template = `-- Migration: ${migrationName}
-- Created: ${now.toISOString()}
-- Description: [Add your description here]

-- Your SQL changes go here
-- Example:
-- ALTER TABLE public.users ADD COLUMN new_field TEXT;

-- Remember to:
-- 1. Test your changes in Supabase Dashboard first
-- 2. Add proper comments
-- 3. Consider rollback scenarios
-- 4. Update any affected RLS policies if needed
`;

  try {
    fs.writeFileSync(filepath, template);
    console.log(`✅ Created migration: ${filename}`);
    console.log(`📁 Location: ${filepath}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Edit the migration file with your SQL changes`);
    console.log(`2. Test in Supabase Dashboard`);
    console.log(`3. Commit to Git: git add supabase/migrations/${filename}`);
  } catch (error) {
    console.error('❌ Error creating migration:', error.message);
    process.exit(1);
  }
}

createMigration();
