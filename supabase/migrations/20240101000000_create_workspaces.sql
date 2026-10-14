-- ============================================================================
-- SyncPad Database Schema & Migration
-- ============================================================================
-- Table: workspaces
-- Supports real-time collaborative clipboard, text, and code sharing with
-- monotonic versioning, optimistic concurrency control, and Row Level Security.
-- Uses TEXT for id to support both custom short room names (e.g. 'k8m2p9', 'my-code')
-- and full UUIDs.
-- ============================================================================

-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    content TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'plaintext',
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure id is TEXT even if table already existed with UUID
DO $$
BEGIN
    ALTER TABLE public.workspaces ALTER COLUMN id TYPE TEXT;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Indexes for efficient lookup and sorting
CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at 
    ON public.workspaces (updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Anonymous Public Workspaces Model:
-- Anyone holding the workspace link can read, create, and update the workspace.
-- Note: Workspaces are public by design. Confidential secrets should not be stored.

-- Policy: Allow public read access
CREATE POLICY "Allow public select on workspaces"
    ON public.workspaces
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Allow public workspace creation
CREATE POLICY "Allow public insert on workspaces"
    ON public.workspaces
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Allow public workspace updates
CREATE POLICY "Allow public update on workspaces"
    ON public.workspaces
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Stored Procedure for Atomic Concurrency Control & Version Verification
-- Locks the workspace row, verifies that the client's expected version matches
-- the current database version, and conditionally increments the version.
-- If a conflict occurs, returns the current server version and content without updating.
CREATE OR REPLACE FUNCTION public.update_workspace_atomic(
    p_id TEXT,
    p_content TEXT,
    p_language TEXT,
    p_expected_version BIGINT
)
RETURNS TABLE (
    success BOOLEAN,
    current_version BIGINT,
    content TEXT,
    language TEXT,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_row public.workspaces%ROWTYPE;
BEGIN
    -- Acquire exclusive row lock
    SELECT * INTO v_row
    FROM public.workspaces
    WHERE id = p_id
    FOR UPDATE;

    -- Return failure if workspace does not exist
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0::BIGINT, ''::TEXT, ''::TEXT, timezone('utc'::text, now());
        RETURN;
    END IF;

    -- If expected version matches server version, perform atomic increment and update
    IF v_row.version = p_expected_version THEN
        UPDATE public.workspaces
        SET
            content = p_content,
            language = p_language,
            version = v_row.version + 1,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_id
        RETURNING * INTO v_row;

        RETURN QUERY SELECT true, v_row.version, v_row.content, v_row.language, v_row.updated_at;
    ELSE
        -- Version conflict detected: Return current server state without updating
        RETURN QUERY SELECT false, v_row.version, v_row.content, v_row.language, v_row.updated_at;
    END IF;
END;
$$;

-- Grant execution permission on atomic update function to anon & authenticated roles
GRANT EXECUTE ON FUNCTION public.update_workspace_atomic(TEXT, TEXT, TEXT, BIGINT) 
    TO anon, authenticated;

-- 6. Enable Supabase Realtime for the workspaces table
-- This enables postgres_changes publications to broadcast UPDATE and INSERT events
-- directly to connected frontend clients.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'workspaces'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
    END IF;
END;
$$;
