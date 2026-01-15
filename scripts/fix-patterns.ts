/**
 * Script to fix exercise patterns in the database
 * Run with: npx tsx scripts/fix-patterns.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

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
  process.exit(1);
}

const supabaseUrl = `https://${supabaseProjectId}.supabase.co`;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the standard patterns
const PATTERNS = {
  // Lower Body
  SQUAT_QUAD: 'Squat - Quad Dominant',
  SQUAT_HIP: 'Squat - Hip Dominant',
  HINGE: 'Hinge',
  HIP_THRUST: 'Hip Thrust',
  LUNGE: 'Lunge/Split Stance',

  // Upper Body Push/Pull
  HORIZONTAL_PUSH: 'Horizontal Push',
  HORIZONTAL_PULL: 'Horizontal Pull',
  VERTICAL_PUSH: 'Vertical Push',
  VERTICAL_PULL: 'Vertical Pull',

  // Isolation Patterns
  ELBOW_FLEXION: 'Elbow Flexion',
  ELBOW_EXTENSION: 'Elbow Extension',
  KNEE_FLEXION: 'Knee Flexion',
  KNEE_EXTENSION: 'Knee Extension',
  SHOULDER_ABDUCTION: 'Shoulder Abduction',
  SHOULDER_ROTATION: 'Shoulder External Rotation',
  HIP_ABDUCTION: 'Hip Abduction',
  HIP_ADDUCTION: 'Hip Adduction',
  CALF: 'Calf',

  // Core/Accessory
  ANTI_ROTATION: 'Anti-Rotation',
  ANTI_EXTENSION: 'Anti-Extension',
  ROTATION: 'Rotation',
  CARRY: 'Carry',

  // Special
  PLYOMETRIC: 'Plyometric',
};

interface Exercise {
  id: string;
  name: string;
  pattern: string;
  primary_body_part: string;
  secondary_body_part: string | null;
  movement_type: string;
  equipment: string;
}

const categorizeExercise = (exercise: Exercise): { pattern: string; confidence: 'high' | 'medium' | 'low'; reason: string } => {
  const name = exercise.name.toLowerCase();
  const bodyPart = exercise.primary_body_part.toLowerCase();
  const movementType = exercise.movement_type.toLowerCase();

  // === CARRIES ===
  if (name.includes('carry') || name.startsWith('carry –')) {
    return { pattern: PATTERNS.CARRY, confidence: 'high', reason: 'Loaded carry exercise' };
  }

  // === PLYOMETRIC ===
  if (name.includes('jump')) {
    return { pattern: PATTERNS.PLYOMETRIC, confidence: 'high', reason: 'Jump/explosive movement' };
  }

  // === CORE PATTERNS ===
  if (bodyPart === 'abdominals') {
    if (name.includes('anti-rotation') || name.includes('pallof') || name.includes('landmine')) {
      return { pattern: PATTERNS.ANTI_ROTATION, confidence: 'high', reason: 'Anti-rotation core exercise' };
    }
    if (name.includes('dead bug') || name.includes('plank')) {
      return { pattern: PATTERNS.ANTI_EXTENSION, confidence: 'high', reason: 'Anti-extension core exercise' };
    }
    if (name.includes('rotation') && !name.includes('anti')) {
      return { pattern: PATTERNS.ROTATION, confidence: 'high', reason: 'Rotational core exercise' };
    }
    if (name.includes('sit-up') || name.includes('crunch')) {
      return { pattern: PATTERNS.ANTI_EXTENSION, confidence: 'medium', reason: 'Flexion-based core exercise' };
    }
    // Captain's chair leg raise - could be anti-extension
    if (name.includes('leg raise')) {
      return { pattern: PATTERNS.ANTI_EXTENSION, confidence: 'medium', reason: 'Hip flexion/anti-extension exercise' };
    }
  }

  // === HIP THRUST ===
  if (name.includes('hip thrust')) {
    return { pattern: PATTERNS.HIP_THRUST, confidence: 'high', reason: 'Hip thrust exercise' };
  }

  // === HINGE PATTERN ===
  if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian')) {
    return { pattern: PATTERNS.HINGE, confidence: 'high', reason: 'Deadlift variation' };
  }
  if (name.includes('back extension') || name.includes('reverse hyper')) {
    return { pattern: PATTERNS.HINGE, confidence: 'high', reason: 'Hip extension exercise' };
  }
  if (name.includes('good morning')) {
    return { pattern: PATTERNS.HINGE, confidence: 'high', reason: 'Good morning - hip hinge' };
  }
  if (name.includes('kettlebell swing')) {
    return { pattern: PATTERNS.HINGE, confidence: 'high', reason: 'Swing - ballistic hinge' };
  }

  // === SQUAT PATTERNS ===
  if (name.includes('squat')) {
    // Check for hip-dominant cues
    if (name.includes('high and wide') || name.includes('glute') || bodyPart === 'glutes') {
      return { pattern: PATTERNS.SQUAT_HIP, confidence: 'high', reason: 'Hip-dominant squat variation' };
    }
    // Default to quad-dominant
    return { pattern: PATTERNS.SQUAT_QUAD, confidence: 'high', reason: 'Quad-dominant squat variation' };
  }

  // === LEG PRESS ===
  if (name.includes('leg press')) {
    if (name.includes('high and wide')) {
      return { pattern: PATTERNS.SQUAT_HIP, confidence: 'high', reason: 'Hip-dominant leg press stance' };
    }
    if (name.includes('low') || name.includes('close')) {
      return { pattern: PATTERNS.SQUAT_QUAD, confidence: 'high', reason: 'Quad-dominant leg press stance' };
    }
    return { pattern: PATTERNS.SQUAT_QUAD, confidence: 'medium', reason: 'Leg press - default quad dominant' };
  }

  // === LUNGE/SPLIT STANCE ===
  if (name.includes('lunge') || name.includes('split squat') || name.includes('bulgarian')) {
    // Check for hip-dominant cues
    if (name.includes('reverse') && name.includes('deficit')) {
      // Deficit reverse lunges can be hip-dominant
      if (bodyPart === 'glutes') {
        return { pattern: PATTERNS.SQUAT_HIP, confidence: 'high', reason: 'Hip-dominant lunge with deficit' };
      }
      return { pattern: PATTERNS.LUNGE, confidence: 'high', reason: 'Reverse deficit lunge' };
    }
    return { pattern: PATTERNS.LUNGE, confidence: 'high', reason: 'Lunge/split stance exercise' };
  }
  if (name.includes('step up')) {
    return { pattern: PATTERNS.LUNGE, confidence: 'high', reason: 'Single leg step pattern' };
  }

  // === KNEE FLEXION (Hamstring curls) ===
  if (name.includes('leg curl') || name.includes('hamstring curl')) {
    return { pattern: PATTERNS.KNEE_FLEXION, confidence: 'high', reason: 'Hamstring curl exercise' };
  }

  // === KNEE EXTENSION (Leg extensions) ===
  if (name.includes('leg extension')) {
    return { pattern: PATTERNS.KNEE_EXTENSION, confidence: 'high', reason: 'Leg extension exercise' };
  }

  // === CALF ===
  if (bodyPart === 'calves' || name.includes('calf raise')) {
    return { pattern: PATTERNS.CALF, confidence: 'high', reason: 'Calf exercise' };
  }

  // === VERTICAL PUSH ===
  if (name.includes('overhead press') || name.includes('shoulder press') || name.includes('military press')) {
    return { pattern: PATTERNS.VERTICAL_PUSH, confidence: 'high', reason: 'Overhead pressing movement' };
  }
  if (name.includes('arnold press')) {
    return { pattern: PATTERNS.VERTICAL_PUSH, confidence: 'high', reason: 'Arnold press - overhead variation' };
  }
  // High incline press (45+ degrees) is more vertical
  if ((name.includes('incline') && name.includes('45')) || name.includes('steep incline')) {
    return { pattern: PATTERNS.VERTICAL_PUSH, confidence: 'medium', reason: 'Steep incline press - more vertical' };
  }

  // === HORIZONTAL PUSH ===
  if (name.includes('bench press') || name.includes('chest press')) {
    // Low incline and decline are horizontal
    if (name.includes('decline') || name.includes('low incline') || name.includes('flat')) {
      return { pattern: PATTERNS.HORIZONTAL_PUSH, confidence: 'high', reason: 'Horizontal pressing angle' };
    }
    // Standard incline (30 degrees) is still horizontal
    if (name.includes('incline') && name.includes('30')) {
      return { pattern: PATTERNS.HORIZONTAL_PUSH, confidence: 'high', reason: 'Moderate incline press' };
    }
    // If just "bench press" with no angle specified, horizontal
    if (!name.includes('incline')) {
      return { pattern: PATTERNS.HORIZONTAL_PUSH, confidence: 'high', reason: 'Flat bench press' };
    }
    // Default incline to horizontal unless steep
    return { pattern: PATTERNS.HORIZONTAL_PUSH, confidence: 'medium', reason: 'Incline press - horizontal default' };
  }
  if (name.includes('push up') || name.includes('pushup') || name.includes('push-up')) {
    return { pattern: PATTERNS.HORIZONTAL_PUSH, confidence: 'high', reason: 'Push-up variation' };
  }
  if (name.includes('dip') && bodyPart === 'chest') {
    return { pattern: PATTERNS.HORIZONTAL_PUSH, confidence: 'high', reason: 'Chest dip' };
  }
  if (name.includes('fly') && bodyPart === 'chest') {
    return { pattern: PATTERNS.HORIZONTAL_PUSH, confidence: 'medium', reason: 'Chest fly - horizontal adduction' };
  }

  // === VERTICAL PULL ===
  if (name.includes('pull up') || name.includes('pull-up') || name.includes('pullup')) {
    return { pattern: PATTERNS.VERTICAL_PULL, confidence: 'high', reason: 'Pull-up variation' };
  }
  if (name.includes('chin up') || name.includes('chin-up') || name.includes('chinup')) {
    return { pattern: PATTERNS.VERTICAL_PULL, confidence: 'high', reason: 'Chin-up variation' };
  }
  if (name.includes('lat pulldown') || name.includes('pulldown')) {
    return { pattern: PATTERNS.VERTICAL_PULL, confidence: 'high', reason: 'Lat pulldown variation' };
  }

  // === HORIZONTAL PULL ===
  if (name.includes('row')) {
    return { pattern: PATTERNS.HORIZONTAL_PULL, confidence: 'high', reason: 'Rowing movement' };
  }
  if (name.includes('reverse fly') || (name.includes('fly') && bodyPart === 'shoulders')) {
    return { pattern: PATTERNS.HORIZONTAL_PULL, confidence: 'medium', reason: 'Rear delt fly - horizontal abduction' };
  }

  // === ELBOW FLEXION (Biceps) ===
  if (bodyPart === 'biceps' || name.includes('bicep curl') || name.includes('biceps curl')) {
    return { pattern: PATTERNS.ELBOW_FLEXION, confidence: 'high', reason: 'Bicep curl variation' };
  }
  if (name.includes('hammer curl')) {
    return { pattern: PATTERNS.ELBOW_FLEXION, confidence: 'high', reason: 'Hammer curl - elbow flexion' };
  }

  // === ELBOW EXTENSION (Triceps) ===
  if (bodyPart === 'triceps' || name.includes('tricep') || name.includes('triceps')) {
    // Close grip bench press is compound but tricep-focused - could be vertical push
    if (name.includes('bench press') && name.includes('close grip')) {
      return { pattern: PATTERNS.VERTICAL_PUSH, confidence: 'medium', reason: 'Close grip bench - compound tricep' };
    }
    // Dips for triceps
    if (name.includes('dip')) {
      return { pattern: PATTERNS.VERTICAL_PUSH, confidence: 'medium', reason: 'Tricep dip - compound' };
    }
    // All other tricep work is elbow extension
    return { pattern: PATTERNS.ELBOW_EXTENSION, confidence: 'high', reason: 'Tricep isolation exercise' };
  }

  // === SHOULDER ABDUCTION (Lateral raises) ===
  if (name.includes('lateral raise') || name.includes('side raise')) {
    return { pattern: PATTERNS.SHOULDER_ABDUCTION, confidence: 'high', reason: 'Lateral raise - shoulder abduction' };
  }
  if (name.includes('upright row')) {
    return { pattern: PATTERNS.SHOULDER_ABDUCTION, confidence: 'medium', reason: 'Upright row - vertical pull with abduction' };
  }

  // === SHOULDER EXTERNAL ROTATION (Face pulls, rear delts) ===
  if (name.includes('face pull')) {
    return { pattern: PATTERNS.SHOULDER_ROTATION, confidence: 'high', reason: 'Face pull - external rotation' };
  }
  if (name.includes('external rotation') || name.includes('rotator cuff')) {
    return { pattern: PATTERNS.SHOULDER_ROTATION, confidence: 'high', reason: 'Shoulder external rotation' };
  }
  if (name.includes('rear delt') && !name.includes('row')) {
    return { pattern: PATTERNS.SHOULDER_ROTATION, confidence: 'medium', reason: 'Rear delt isolation' };
  }

  // === HIP ABDUCTION ===
  if (name.includes('hip abduction') || (name.includes('abduction') && bodyPart === 'glutes')) {
    return { pattern: PATTERNS.HIP_ABDUCTION, confidence: 'high', reason: 'Hip abduction exercise' };
  }
  if (name.includes('clamshell') || name.includes('fire hydrant')) {
    return { pattern: PATTERNS.HIP_ABDUCTION, confidence: 'high', reason: 'Hip abduction movement' };
  }

  // === HIP ADDUCTION ===
  if (name.includes('hip adduction') || (name.includes('adduction') && (bodyPart === 'glutes' || bodyPart === 'quads'))) {
    return { pattern: PATTERNS.HIP_ADDUCTION, confidence: 'high', reason: 'Hip adduction exercise' };
  }

  // === FRONT RACK CARRIES - these are squats ===
  if (name.includes('front rack')) {
    return { pattern: PATTERNS.SQUAT_QUAD, confidence: 'medium', reason: 'Front rack carry - squat pattern component' };
  }

  // Fallback - uncertain
  return {
    pattern: 'NEEDS_REVIEW',
    confidence: 'low',
    reason: `Uncertain - ${bodyPart}, ${movementType}`
  };
};

const fixPatterns = async () => {
  console.log('Fetching exercises from database...\n');

  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, name, pattern, primary_body_part, secondary_body_part, movement_type, equipment')
    .order('name');

  if (error) {
    console.error('Error fetching exercises:', error);
    return;
  }

  if (!exercises) {
    console.error('No exercises found');
    return;
  }

  console.log(`Analyzing ${exercises.length} exercises...\n`);

  // Categorize all exercises
  const updates: Array<{
    id: string;
    name: string;
    oldPattern: string;
    newPattern: string;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
    needsReview: boolean;
  }> = [];

  exercises.forEach((exercise: Exercise) => {
    const result = categorizeExercise(exercise);
    const needsReview = result.confidence === 'low' || result.pattern === 'NEEDS_REVIEW';

    let finalPattern = result.pattern;

    // For exercises needing review, keep current pattern but add "?" suffix
    if (needsReview) {
      // Clean up the current pattern first (remove existing "?" if present)
      const cleanPattern = exercise.pattern.replace(/\?+$/, '').trim();
      // Add "?" to flag for review
      finalPattern = `${cleanPattern}?`;
    }

    // Only add to updates if pattern is different or needs review
    if (exercise.pattern !== finalPattern) {
      updates.push({
        id: exercise.id,
        name: exercise.name,
        oldPattern: exercise.pattern,
        newPattern: finalPattern,
        confidence: result.confidence,
        reason: result.reason,
        needsReview
      });
    }
  });

  // Generate preview file
  let preview = '# Exercise Pattern Updates Preview\n\n';
  preview += `Total exercises analyzed: ${exercises.length}\n`;
  preview += `Exercises requiring updates: ${updates.length}\n\n`;

  // Group by confidence
  const highConfidence = updates.filter(u => !u.needsReview && u.confidence === 'high');
  const mediumConfidence = updates.filter(u => !u.needsReview && u.confidence === 'medium');
  const needsReview = updates.filter(u => u.needsReview);

  preview += `## Summary\n\n`;
  preview += `- ✅ High confidence updates: ${highConfidence.length}\n`;
  preview += `- ⚠️  Medium confidence updates: ${mediumConfidence.length}\n`;
  preview += `- ❌ Needs manual review: ${needsReview.length}\n\n`;

  // High confidence section
  if (highConfidence.length > 0) {
    preview += `## ✅ High Confidence Updates (${highConfidence.length})\n\n`;
    highConfidence.forEach(u => {
      preview += `### ${u.name}\n`;
      preview += `- **Old:** ${u.oldPattern}\n`;
      preview += `- **New:** ${u.newPattern}\n`;
      preview += `- **Reason:** ${u.reason}\n\n`;
    });
  }

  // Medium confidence section
  if (mediumConfidence.length > 0) {
    preview += `## ⚠️  Medium Confidence Updates (${mediumConfidence.length})\n\n`;
    preview += `*These updates are likely correct but please review*\n\n`;
    mediumConfidence.forEach(u => {
      preview += `### ${u.name}\n`;
      preview += `- **Old:** ${u.oldPattern}\n`;
      preview += `- **New:** ${u.newPattern}\n`;
      preview += `- **Reason:** ${u.reason}\n\n`;
    });
  }

  // Needs review section
  if (needsReview.length > 0) {
    preview += `## ❌ Needs Manual Review (${needsReview.length})\n\n`;
    preview += `*These exercises could not be automatically categorized with confidence.*\n`;
    preview += `*Pattern will be kept but flagged with "?" for future review.*\n\n`;
    needsReview.forEach(u => {
      preview += `### ${u.name}\n`;
      preview += `- **Current:** ${u.oldPattern}\n`;
      preview += `- **Updated to:** ${u.newPattern} *(flagged for review)*\n`;
      preview += `- **Reason:** ${u.reason}\n\n`;
    });
  }

  // Write preview file
  const previewPath = 'scripts/pattern-updates-preview.md';
  writeFileSync(previewPath, preview);
  console.log(`✅ Preview written to ${previewPath}\n`);

  // Generate SQL update script
  let sql = '-- Exercise Pattern Updates\n';
  sql += '-- Generated automatically\n';
  sql += `-- Date: ${new Date().toISOString()}\n\n`;

  sql += '-- High and Medium confidence updates\n';
  sql += 'BEGIN;\n\n';

  [...highConfidence, ...mediumConfidence].forEach(u => {
    sql += `-- ${u.name} (${u.confidence} confidence)\n`;
    sql += `-- Old: "${u.oldPattern}" -> New: "${u.newPattern}"\n`;
    sql += `-- Reason: ${u.reason}\n`;
    sql += `UPDATE exercises SET pattern = '${u.newPattern.replace(/'/g, "''")}' WHERE id = '${u.id}';\n\n`;
  });

  // Include needs review items - they'll get the "?" suffix
  if (needsReview.length > 0) {
    sql += '-- Exercises needing manual review (flagged with "?" suffix)\n';
    needsReview.forEach(u => {
      sql += `-- ${u.name} - Could not auto-categorize\n`;
      sql += `-- Old: "${u.oldPattern}" -> New: "${u.newPattern}" (flagged for review)\n`;
      sql += `-- Reason: ${u.reason}\n`;
      sql += `UPDATE exercises SET pattern = '${u.newPattern.replace(/'/g, "''")}' WHERE id = '${u.id}';\n\n`;
    });
  }

  sql += 'COMMIT;\n';

  // Write SQL file
  const sqlPath = 'scripts/update-patterns.sql';
  writeFileSync(sqlPath, sql);
  console.log(`✅ SQL script written to ${sqlPath}\n`);

  // Summary
  console.log('=== SUMMARY ===\n');
  console.log(`✅ ${highConfidence.length} high confidence updates ready`);
  console.log(`⚠️  ${mediumConfidence.length} medium confidence updates ready`);
  console.log(`❌ ${needsReview.length} exercises need manual review\n`);

  console.log('Next steps:');
  console.log('1. Review the preview file: scripts/pattern-updates-preview.md');
  console.log('2. If satisfied, run the SQL script in your Supabase SQL editor');
  console.log('3. Manually categorize the exercises that need review\n');
};

fixPatterns();
