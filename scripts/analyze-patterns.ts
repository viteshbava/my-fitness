/**
 * Script to analyze current exercise patterns in the database
 * Run with: npx tsx scripts/analyze-patterns.ts
 *
 * Make sure to export your Supabase credentials first:
 * export NEXT_PUBLIC_SUPABASE_URL="your-url"
 * export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local and parse it
const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const supabaseProjectId = envVars.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseProjectId || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.error('Found:', { supabaseProjectId, hasKey: !!supabaseKey });
  process.exit(1);
}

const supabaseUrl = `https://${supabaseProjectId}.supabase.co`;

const supabase = createClient(supabaseUrl, supabaseKey);

const analyzePatterns = async () => {
  // Get all distinct patterns
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('pattern, name, primary_body_part, movement_type, equipment');

  if (error) {
    console.error('Error fetching exercises:', error);
    return;
  }

  // Group by pattern
  const patternGroups: Record<string, any[]> = {};
  exercises?.forEach((ex) => {
    const pattern = ex.pattern || 'NULL';
    if (!patternGroups[pattern]) {
      patternGroups[pattern] = [];
    }
    patternGroups[pattern].push(ex);
  });

  // Display results
  console.log('\n=== CURRENT PATTERNS IN DATABASE ===\n');
  Object.keys(patternGroups)
    .sort()
    .forEach((pattern) => {
      console.log(`\n${pattern} (${patternGroups[pattern].length} exercises)`);
      console.log('─'.repeat(50));
      patternGroups[pattern].slice(0, 5).forEach((ex) => {
        console.log(`  • ${ex.name} - ${ex.primary_body_part} - ${ex.movement_type}`);
      });
      if (patternGroups[pattern].length > 5) {
        console.log(`  ... and ${patternGroups[pattern].length - 5} more`);
      }
    });

  console.log('\n\n=== SUMMARY ===');
  console.log(`Total exercises: ${exercises?.length}`);
  console.log(`Unique patterns: ${Object.keys(patternGroups).length}`);
  console.log('\nPattern counts:');
  Object.keys(patternGroups)
    .sort((a, b) => patternGroups[b].length - patternGroups[a].length)
    .forEach((pattern) => {
      console.log(`  ${pattern}: ${patternGroups[pattern].length}`);
    });
};

analyzePatterns();
