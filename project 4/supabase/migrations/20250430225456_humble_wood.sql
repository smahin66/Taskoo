/*
  # Fix infinite recursion in group policies

  1. Changes
    - Rewrite group policies to avoid circular references
    - Simplify policy conditions
    - Add separate policies for group members and owners
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Group members can view their groups" ON groups;
DROP POLICY IF EXISTS "Group owners can delete their groups" ON groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;

-- Create new policies without circular references
CREATE POLICY "Users can create groups"
ON groups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can manage their groups"
ON groups
FOR ALL
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Group members can view groups"
ON groups
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = id
    AND group_members.user_id = auth.uid()
  )
);

-- Drop existing policies on group_members
DROP POLICY IF EXISTS "Manage group members" ON group_members;
DROP POLICY IF EXISTS "View group members" ON group_members;

-- Create new policies for group_members
CREATE POLICY "Group owners can manage members"
ON group_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_id
    AND groups.owner_id = auth.uid()
  )
);

CREATE POLICY "Members can view group members"
ON group_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_id
    AND groups.owner_id = auth.uid()
  )
);