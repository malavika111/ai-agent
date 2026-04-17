import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const userId = user.id

    // We need the SERVICE_ROLE_KEY to delete the auth.user and bypass RLS for data cleanup
    // NOTE: This must be in your .env.local as SUPABASE_SERVICE_ROLE_KEY
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Delete all user document chunks (Cascade usually handles this, but let's be explicit)
    const { data: docs } = await adminClient.from('documents').select('id').eq('user_id', userId)
    if (docs && docs.length > 0) {
      const docIds = docs.map(d => d.id)
      await adminClient.from('document_chunks').delete().in('document_id', docIds)
    }

    // 2. Delete all user document records
    await adminClient.from('documents').delete().eq('user_id', userId)

    // 3. Delete all chat sessions and messages
    await adminClient.from('chat_sessions').delete().eq('user_id', userId)
    await adminClient.from('messages').delete().eq('user_id', userId)

    // 4. Delete files from Storage
    // We list files in the user's dedicated folder: [userId]/*
    try {
      const { data: files } = await adminClient.storage.from('documents').list(userId)
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${userId}/${f.name}`)
        await adminClient.storage.from('documents').remove(filePaths)
      }
    } catch (storageErr) {
      console.error('Storage Cleanup Error:', storageErr)
    }

    // 5. Delete the Auth User last (This logs them out permanently)
    const { error: deleteUserErr } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteUserErr) {
      throw new Error('Failed to delete auth user: ' + deleteUserErr.message)
    }

    return new Response(JSON.stringify({ message: 'Account and associated data deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('Account Deletion Error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Deletion failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
