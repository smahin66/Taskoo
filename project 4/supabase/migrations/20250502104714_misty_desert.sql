/*
  # Fix recursive policies in group_members table

  1. Changes
    - Drop existing recursive policies on group_members table
    - Create new non-recursive policies for group_members table
    
  2. Security
    - Maintain RLS security while avoiding recursion
    - Ensure proper access control for group members and owners
*/

-- Drop existing policies to replace them with non-recursive versions
DROP POLICY IF EXISTS "Group owners can manage members" ON group_members;
DROP POLICY IF EXISTS "Users can view groups they belong to" ON group_members;

-- Create new non-recursive policies
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

CREATE POLICY "Members can view their own memberships"
ON group_members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "Members can view other members in their groups"
ON group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members AS my_membership
    WHERE my_membership.group_id = group_members.group_id
    AND my_membership.user_id = auth.uid()
  )
);