#!/usr/bin/env node

/**
 * Commit Supabase migrations to Git
 * Usage: node scripts/commit-migrations.js "add user preferences table"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function commitMigrations() {
  const description = process.argv[2];
  
  if (!description) {
    console.error('❌ Please provide a commit description');
    console.log('Usage: node scripts/commit-migrations.js "your commit message"');
    process.exit(1);
  }

  try {
    // Check if there are any migration files to commit
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    
    if (files.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    console.log('📁 Found migration files:', files);

    // Add migration files to git
    execSync('git add supabase/migrations/', { stdio: 'inherit' });
    
    // Commit with description
    const commitMessage = `feat: ${description}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    console.log('✅ Migrations committed successfully!');
    console.log('🚀 Next step: git push origin main');
    
  } catch (error) {
    console.error('❌ Error committing migrations:', error.message);
    process.exit(1);
  }
}

commitMigrations();
