/**
 * Import exercises from CSV file to Supabase
 *
 * Usage:
 *   npx tsx scripts/import-exercises.ts
 *
 * Prerequisites:
 *   1. Create the exercises table in Supabase (run create-exercises-table.sql)
 *   2. Set up .env.local with your Supabase credentials
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim();
    }
  });
}

// Get Supabase credentials
const supabaseProjectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseProjectId || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_PROJECT_ID and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabaseUrl = `https://${supabaseProjectId}.supabase.co`;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CSVRow {
  'Exercise (old name)': string;
  'Description': string;
  'Name with Link': string;
  'Movement Type': string;
  'Pattern': string;
  'Primary Body Part': string;
  'Secondary Body Part': string;
  'Equipment': string;
}

async function importExercises() {
  console.log('🏋️  Starting exercise import...\n');

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'data', 'ExcerciseData.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records: CSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📊 Found ${records.length} exercises in CSV\n`);

  // Transform and insert exercises
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      // Extract video URL from the Google Drive link
      const videoUrl = record['Name with Link'] || null;

      // Prepare exercise data
      const exercise = {
        name: record['Description'] || record['Exercise (old name)'],
        video_url: videoUrl,
        movement_type: record['Movement Type'] || 'Unknown',
        pattern: record['Pattern'] || 'Unknown',
        primary_body_part: record['Primary Body Part'] || 'Unknown',
        secondary_body_part: record['Secondary Body Part'] || '',
        equipment: record['Equipment'] || 'Unknown',
        is_mastered: false,
        notes: null,
        last_used_date: null,
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('exercises')
        .insert(exercise);

      if (error) {
        console.error(`❌ Error importing "${exercise.name}": ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Imported: ${exercise.name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error processing record:`, err);
      errorCount++;
    }
  }

  // Summary
  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${records.length}`);

  if (successCount === records.length) {
    console.log('\n🎉 All exercises imported successfully!');
  } else if (successCount > 0) {
    console.log('\n⚠️  Some exercises failed to import. Check errors above.');
  } else {
    console.log('\n❌ Import failed. Please check your Supabase connection and table setup.');
  }
}

// Run import
importExercises().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
