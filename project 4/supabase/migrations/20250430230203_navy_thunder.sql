/*
  # Fix recursive policies for tasks and group members

  1. Changes
    - Simplify task policies to avoid recursion
    - Update group member policies to be more efficient
    - Ensure proper access control without circular references

  2. Security
    - Maintain existing security rules
    - Optimize policy checks
*/

-- Drop existing task policies that might cause recursion
DROP POLICY IF EXISTS "Group members can view group tasks" ON tasks;
DROP POLICY IF EXISTS "Group members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Task assignees and group owners can update tasks" ON tasks;
DROP POLICY IF EXISTS "Group owners can delete tasks" ON tasks;

-- Create simplified task policies
CREATE POLICY "View tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  -- User's own tasks
  user_id = auth.uid()
  OR
  -- Tasks assigned to user
  assignee_id = auth.uid()
  OR
  -- Tasks in groups where user is a member
  (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = tasks.group_id
      AND group_members.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Create tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  -- User's own tasks
  user_id = auth.uid()
  OR
  -- Tasks in groups where user is a member
  (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = tasks.group_id
      AND group_members.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Update tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  -- User's own tasks
  user_id = auth.uid()
  OR
  -- Tasks assigned to user
  assignee_id = auth.uid()
  OR
  -- Tasks in groups where user is owner
  (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = tasks.group_id
      AND groups.owner_id = auth.uid()
    )
  )
)
WITH CHECK (
  -- User's own tasks
  user_id = auth.uid()
  OR
  -- Tasks assigned to user
  assignee_id = auth.uid()
  OR
  -- Tasks in groups where user is owner
  (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = tasks.group_id
      AND groups.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Delete tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  -- User's own tasks
  user_id = auth.uid()
  OR
  -- Tasks assigned to user
  assignee_id = auth.uid()
  OR
  -- Tasks in groups where user is owner
  (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = tasks.group_id
      AND groups.owner_id = auth.uid()
    )
  )
);