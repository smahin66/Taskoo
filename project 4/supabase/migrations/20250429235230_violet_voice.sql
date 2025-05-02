/*
  # Update profiles table structure

  1. Changes to Profiles Table
    - Remove owl_customization column
*/

-- Drop owl_customization column if it exists
ALTER TABLE profiles 
DROP COLUMN IF EXISTS owl_customization;

-- Drop owl_accessories table if it exists
DROP TABLE IF EXISTS owl_accessories;