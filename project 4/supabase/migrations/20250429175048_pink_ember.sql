/*
  # Add owl customization features

  1. Changes to Profiles Table
    - Add owl_customization JSONB column with default structure
    - Includes color, accessories, evolution stage, and family info

  2. New Table: owl_accessories
    - Stores unlockable accessories for owls
    - Default accessories with required points
    - Public read access via RLS
*/

-- Add owl customization column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS owl_customization JSONB DEFAULT jsonb_build_object(
  'color', 'brown',
  'accessories', ARRAY[]::text[],
  'evolution_stage', 'egg',
  'experience_points', 0,
  'reliability_score', 0,
  'last_evaluation', NULL,
  'family', jsonb_build_object(
    'has_partner', false,
    'children', ARRAY[]::jsonb[]
  )
);

-- Create owl_accessories table if it doesn't exist
CREATE TABLE IF NOT EXISTS owl_accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text,
  required_points integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default accessories
INSERT INTO owl_accessories (name, type, description, required_points) VALUES
  ('Graduation Cap', 'hat', 'A scholarly cap for wise owls', 100),
  ('Reading Glasses', 'eyes', 'Stylish glasses for focused study', 50),
  ('Bow Tie', 'neck', 'A dapper bow tie for formal occasions', 75),
  ('Magic Wand', 'accessory', 'A mystical wand for magical focus', 200),
  ('Golden Wings', 'wings', 'Majestic golden wings for high achievers', 500)
ON CONFLICT DO NOTHING;

-- Enable RLS and create policy if it doesn't exist
ALTER TABLE owl_accessories ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'owl_accessories' 
    AND policyname = 'Anyone can view accessories'
  ) THEN
    CREATE POLICY "Anyone can view accessories"
      ON owl_accessories
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;