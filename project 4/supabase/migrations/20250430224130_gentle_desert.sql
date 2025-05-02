/*
  # Fix infinite recursion in group_members policy

  1. Changes
    - Drop existing problematic policies on group_members table
    - Create new, optimized policies without recursion
    
  2. Security
    - Maintain RLS protection
    - Ensure proper access control for group members and owners
    - Prevent infinite recursion in policy evaluation
*/

-- Drop existing policies that are causing recursion
DROP POLICY IF EXISTS "Members can view group members" ON group_members;
DROP POLICY IF EXISTS "Group owners can manage members" ON group_members;

-- Create new, optimized policies without recursion
CREATE POLICY "View group members"
ON group_members
FOR SELECT
TO authenticated
USING (
  -- Allow if user is a member of the group
  user_id = auth.uid()
  OR
  -- Allow if user is the owner of the group
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.owner_id = auth.uid()
  )
);

CREATE POLICY "Manage group members"
ON group_members
FOR ALL
TO authenticated
USING (
  -- Only group owners can manage members
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.owner_id = auth.uid()
  )
)
WITH CHECK (
  -- Only group owners can manage members
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.owner_id = auth.uid()
  )
);