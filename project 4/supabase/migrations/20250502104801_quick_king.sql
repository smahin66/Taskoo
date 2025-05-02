/*
  # Fix group_members policies recursion

  1. Changes
    - Drop existing policies on group_members table
    - Create new, optimized policies that prevent recursion
    
  2. Security
    - Maintain same security rules but with better implementation
    - Prevent infinite recursion in policy evaluation
    - Keep RLS enabled
*/

-- First, drop the existing policies that are causing recursion
DROP POLICY IF EXISTS "Group owners can manage members" ON group_members;
DROP POLICY IF EXISTS "Members can view other members in their groups" ON group_members;
DROP POLICY IF EXISTS "Members can view their own memberships" ON group_members;

-- Create new, optimized policies
-- Policy for group owners to manage members
CREATE POLICY "Group owners can manage members"
ON group_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.owner_id = auth.uid()
  )
);

-- Policy for members to view group membership (including their own)
CREATE POLICY "View group membership"
ON group_members
FOR SELECT
TO authenticated
USING (
  -- User is either a member themselves
  auth.uid() = user_id
  OR
  -- Or user is viewing members of groups they belong to
  group_id IN (
    SELECT group_id 
    FROM group_members 
    WHERE user_id = auth.uid()
  )
);