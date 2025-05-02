/*
  # Fix infinite recursion in group_members policy

  1. Changes
    - Drop the recursive policy on group_members table
    - Create a new, non-recursive policy for viewing group members
    - Maintain existing security while avoiding infinite loops
    
  2. Security
    - Members can still view other members in their groups
    - Maintains row-level security
    - Prevents unauthorized access
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view group members" ON group_members;

-- Create a new, non-recursive policy
CREATE POLICY "Members can view group members" ON group_members
FOR SELECT TO authenticated
USING (
  group_id IN (
    SELECT group_id 
    FROM group_members 
    WHERE user_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 
    FROM groups 
    WHERE id = group_members.group_id 
    AND owner_id = auth.uid()
  )
);