-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Group members can view their groups" ON groups;
DROP POLICY IF EXISTS "Group owners can manage their groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group members can view groups" ON groups;
DROP POLICY IF EXISTS "Group owners can manage members" ON group_members;
DROP POLICY IF EXISTS "Members can view group members" ON group_members;

-- Create simplified policies for groups
CREATE POLICY "View groups"
ON groups
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Manage groups"
ON groups
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Create simplified policies for group_members
CREATE POLICY "View members"
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

CREATE POLICY "Manage members"
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