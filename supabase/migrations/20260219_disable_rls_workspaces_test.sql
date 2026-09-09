-- Temporary: Disable RLS on workspaces table for testing
-- This helps identify if RLS policies are causing the insert issue

ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;

-- After testing, you can re-enable with:
-- ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
