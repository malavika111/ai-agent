import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: You must be logged in' }, { status: 401 })
    }

    const { documentId } = await request.json().catch(() => ({}))

    if (!documentId) {
      return NextResponse.json({ error: 'documentId required in payload' }, { status: 400 })
    }

    // Get document URL
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('url, user_id')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      console.error('Supabase Document Fetch Error:', fetchError)
      return NextResponse.json({ error: 'Document not found in database or query failed' }, { status: 404 })
    }

    // Ensure user owns document
    if (document.user_id !== user.id) {
       return NextResponse.json({ error: 'Unauthorized: You do not own this document' }, { status: 403 })
    }

    // Parse the file path using the same upload logic
    let storagePath = null;
    try {
      const urlObj = new URL(document.url)
      const pathParts = urlObj.pathname.split('/documents/')
      if (pathParts.length > 1) {
         storagePath = decodeURIComponent(pathParts[1])
      } else {
         const bucketPathMatch = document.url.match(/documents\/([^?]+)/)
         storagePath = bucketPathMatch ? decodeURIComponent(bucketPathMatch[1]) : null
      }
    } catch (parseError) {
      console.error('Storage URL Parsing Error:', parseError)
    }

    if (storagePath) {
      const { error: deleteStorageError } = await supabase.storage.from('documents').remove([storagePath])
      if (deleteStorageError) {
        console.error("Supabase Storage deletion error (File keeps existing):", deleteStorageError)
        // Non fatal, continue to DB deletion.
      }
    }

    // Delete document chunks (if no cascade)
    const { error: chunkDeleteError } = await supabase
       .from('document_chunks')
       .delete()
       .eq('document_id', documentId)

    if (chunkDeleteError) {
       console.error("Supabase Vector Chunk deletion error:", chunkDeleteError)
    }

    const { error: deleteDbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteDbError) {
       console.error("Supabase Documents Table deletion error:", deleteDbError)
       throw deleteDbError
    }

    return NextResponse.json({ success: true, message: 'Document successfully deleted' }, { status: 200 })
  } catch (error: any) {
    console.error('Delete Document Fatal Internal Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown internal server error' }, { status: 500 })
  }
}

