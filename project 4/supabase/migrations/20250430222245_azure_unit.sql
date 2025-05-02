/*
  # Add group work functionality

  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `owner_id` (uuid, references auth.users)

    - `group_members`
      - `group_id` (uuid, references groups)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `joined_at` (timestamptz)

    - `group_invites`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `email` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Changes to Tasks Table
    - Add `group_id` (uuid, references groups)
    - Add `assignee_id` (uuid, references auth.users)

  3. Security
    - Enable RLS on all new tables
    - Add policies for group members
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(name, owner_id)
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text CHECK (role IN ('owner', 'member')) DEFAULT 'member',
    joined_at timestamptz DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
);

-- Create group_invites table
CREATE TABLE IF NOT EXISTS group_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    email text NOT NULL,
    status text CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Add columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- Policies for groups
CREATE POLICY "Users can create groups"
    ON groups
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group members can view their groups"
    ON groups
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group owners can update their groups"
    ON groups
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can delete their groups"
    ON groups
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Policies for group_members
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

CREATE POLICY "Members can view group members"
    ON group_members
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
        )
    );

-- Policies for group_invites
CREATE POLICY "Group owners can manage invites"
    ON group_invites
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM groups
            WHERE groups.id = group_invites.group_id
            AND groups.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their invites"
    ON group_invites
    FOR SELECT
    TO authenticated
    USING (
        auth.email() = email
        AND status = 'pending'
        AND expires_at > now()
    );

-- Update task policies
CREATE POLICY "Group members can view group tasks"
    ON tasks
    FOR SELECT
    TO authenticated
    USING (
        group_id IS NULL 
        OR EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = tasks.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create tasks"
    ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        group_id IS NULL 
        OR EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = tasks.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Task assignees and group owners can update tasks"
    ON tasks
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = assignee_id
        OR EXISTS (
            SELECT 1 FROM groups
            WHERE groups.id = tasks.group_id
            AND groups.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = assignee_id
        OR EXISTS (
            SELECT 1 FROM groups
            WHERE groups.id = tasks.group_id
            AND groups.owner_id = auth.uid()
        )
    );

CREATE POLICY "Group owners can delete tasks"
    ON tasks
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = assignee_id
        OR EXISTS (
            SELECT 1 FROM groups
            WHERE groups.id = tasks.group_id
            AND groups.owner_id = auth.uid()
        )
    );