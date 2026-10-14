import { supabase, isSupabaseConfigured } from './supabaseClient'
import type { Workspace, WorkspaceUpdateResult, SupportedLanguage } from '../types/workspace'

export const workspaceService = {
  /**
   * Fetches an existing workspace by its UUID.
   */
  async getWorkspace(id: string): Promise<Workspace | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
      )
    }

    const { data, error } = await supabase
      .from('workspaces')
      .select('id, content, language, version, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('[workspaceService] Error fetching workspace:', error.message)
      throw new Error(`Failed to load workspace: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      content: data.content ?? '',
      language: (data.language as SupportedLanguage) || 'plaintext',
      version: Number(data.version ?? 1),
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  /**
   * Creates a new workspace row in the database.
   */
  async createWorkspace(
    id: string,
    initialContent: string = '',
    language: SupportedLanguage = 'plaintext'
  ): Promise<Workspace> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
      )
    }

    const newRecord = {
      id,
      content: initialContent,
      language,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('workspaces')
      .insert(newRecord)
      .select('id, content, language, version, created_at, updated_at')
      .single()

    if (error) {
      console.error('[workspaceService] Error creating workspace:', error.message)
      throw new Error(`Failed to create workspace: ${error.message}`)
    }

    return {
      id: data.id,
      content: data.content ?? '',
      language: (data.language as SupportedLanguage) || 'plaintext',
      version: Number(data.version ?? 1),
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  /**
   * Updates workspace content and language using optimistic concurrency control.
   * Ensures atomic version incrementation and rejects stale updates.
   */
  async updateWorkspace(
    id: string,
    content: string,
    language: SupportedLanguage,
    expectedVersion: number
  ): Promise<WorkspaceUpdateResult> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          'Supabase is not configured. Changes are saved locally only until credentials are provided.',
      }
    }

    // Try RPC stored procedure first for atomic row lock and update
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'update_workspace_atomic',
        {
          p_id: id,
          p_content: content,
          p_language: language,
          p_expected_version: expectedVersion,
        }
      )

      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
        const res = rpcData[0]
        if (res.success) {
          return {
            success: true,
            workspace: {
              id,
              content: res.content,
              language: res.language as SupportedLanguage,
              version: Number(res.current_version),
              created_at: '',
              updated_at: res.updated_at,
            },
          }
        } else {
          // Version conflict detected by server
          return {
            success: false,
            conflict: {
              serverVersion: Number(res.current_version),
              serverContent: res.content,
              serverLanguage: res.language as SupportedLanguage,
              serverUpdatedAt: res.updated_at,
            },
          }
        }
      }
    } catch {
      // If RPC is unavailable, fallback gracefully to conditional table update
    }

    // Fallback: conditional table update matching id AND version
    const nextVersion = expectedVersion + 1
    const nowIso = new Date().toISOString()

    const { data: updatedData, error: updateError } = await supabase
      .from('workspaces')
      .update({
        content,
        language,
        version: nextVersion,
        updated_at: nowIso,
      })
      .eq('id', id)
      .eq('version', expectedVersion)
      .select('id, content, language, version, created_at, updated_at')
      .maybeSingle()

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      }
    }

    if (updatedData) {
      return {
        success: true,
        workspace: {
          id: updatedData.id,
          content: updatedData.content ?? '',
          language: (updatedData.language as SupportedLanguage) || 'plaintext',
          version: Number(updatedData.version),
          created_at: updatedData.created_at,
          updated_at: updatedData.updated_at,
        },
      }
    }

    // No row was updated — this means the server version has changed (conflict) or row was deleted.
    const { data: currentServerData } = await supabase
      .from('workspaces')
      .select('id, content, language, version, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (currentServerData) {
      return {
        success: false,
        conflict: {
          serverVersion: Number(currentServerData.version),
          serverContent: currentServerData.content ?? '',
          serverLanguage:
            (currentServerData.language as SupportedLanguage) || 'plaintext',
          serverUpdatedAt: currentServerData.updated_at,
        },
      }
    }

    return {
      success: false,
      error: 'Workspace not found or was removed on the server.',
    }
  },
}
