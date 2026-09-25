import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually to ensure compatibility across environments
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env file');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase project:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

const requiredTables = [
  'profiles',
  'user_interests',
  'user_roles',
  'projects',
  'project_tags',
  'project_versions',
  'validation_cycles',
  'review_questions',
  'reviews',
  'review_answers',
  'reviewer_matches',
  'related_projects',
  'project_insights',
  'improvement_suggestions',
  'innovation_signals',
  'project_votes',
  'notifications',
  'discussions',
  'discussion_comments'
];

async function checkDatabase() {
  console.log('\n📊 Checking table presence in Supabase database...\n');
  let missingTables = [];
  let existingTables = [];

  for (const table of requiredTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        missingTables.push(table);
        console.log(`❌ Table missing: ${table}`);
      } else {
        // Table exists but RLS or empty
        existingTables.push(table);
        console.log(`✅ Table ready: ${table} (Status: ${error.message || 'OK'})`);
      }
    } else {
      existingTables.push(table);
      console.log(`✅ Table ready: ${table} (${data?.length || 0} rows found)`);
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Total Tables Configured: ${existingTables.length}/${requiredTables.length}`);
  if (missingTables.length > 0) {
    console.log(`⚠️ Missing Tables (${missingTables.length}):`, missingTables.join(', '));
    console.log('\n💡 Please execute the SQL queries from `supabase/schema.sql` in your Supabase Dashboard SQL Editor.');
    console.log(`👉 Supabase Dashboard URL: https://supabase.com/dashboard/project/stfpitwhsemzpnevvheq/sql/new\n`);
  } else {
    console.log('🎉 All tables are active and ready in Supabase!\n');
  }
}

checkDatabase();
