/*
  # Add owl avatar customization system

  1. Add to profiles table:
    - owl_customization (jsonb): Stores owl avatar customization data
      - color: Base color of the owl
      - accessories: Array of equipped accessories
      - evolution_stage: Current evolution stage
      - experience_points: Total points earned
      - reliability_score: Average concentration score
      - last_evaluation: Last self-evaluation data
      - family: Family status and details

  2. Create owl_accessories table:
    - Available accessories for owls
    - Unlocking conditions
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

-- Create owl_accessories table
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

-- Add RLS policies
ALTER TABLE owl_accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view accessories"
  ON owl_accessories
  FOR SELECT
  TO public
  USING (true);