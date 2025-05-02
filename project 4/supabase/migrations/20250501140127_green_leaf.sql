/*
  # Fix group_members policies

  1. Changes
    - Remove redundant policies that were causing infinite recursion
    - Simplify policy conditions to avoid circular references
    - Consolidate policies for better maintainability

  2. Security
    - Maintain existing security model where:
      - Group owners can manage members
      - Users can view groups they are members of
      - Users can view their own memberships
*/

-- First, drop the existing policies that are causing issues
DROP POLICY IF EXISTS "Manage group members" ON group_members;
DROP POLICY IF EXISTS "Manage members" ON group_members;
DROP POLICY IF EXISTS "View group members" ON group_members;
DROP POLICY IF EXISTS "View members" ON group_members;

-- Create new, simplified policies
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

CREATE POLICY "Users can view groups they belong to"
ON group_members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM groups 
    WHERE groups.id = group_members.group_id 
    AND groups.owner_id = auth.uid()
  )
);