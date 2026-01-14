-- Create workout_templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_exercises table (similar to workout_exercises but for templates)
CREATE TABLE IF NOT EXISTS template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON template_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_exercise_id ON template_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_order_index ON template_exercises(template_id, order_index);

-- Add trigger to auto-update updated_at timestamp for workout_templates
CREATE OR REPLACE FUNCTION update_workout_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_templates_updated_at();

-- Add trigger to auto-update updated_at timestamp for template_exercises
CREATE OR REPLACE FUNCTION update_template_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_exercises_updated_at
  BEFORE UPDATE ON template_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_template_exercises_updated_at();
