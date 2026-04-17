import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'
// @ts-ignore
import pdf from 'pdf-parse'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files: File[] = []
    const singleFile = formData.get('file') as File | null
    if (singleFile) files.push(singleFile)
    
    formData.getAll('files').forEach(f => {
      if (f instanceof File) files.push(f)
    })

    if (files.length === 0) {
      return NextResponse.json({ error: 'No file(s) provided' }, { status: 400 })
    }

    const results: { name: string; documentId: string; success: boolean; error?: string }[] = []

    for (const file of files) {
      try {
        if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
          results.push({ name: file.name, documentId: '', success: false, error: 'Unsupported file type' })
          continue
        }

        const fileBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(fileBuffer)

        // 1. Generate Safe Storage Path (UUID-based to avoid character issues)
        const fileExt = file.name.split('.').pop() || 'txt'
        const safeStoragePath = `${user.id}/${uuidv4()}.${fileExt}`

        // 2. Upload to Supabase Storage using safe path
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(safeStoragePath, buffer, { contentType: file.type })

        if (uploadError) {
          console.error(`Storage error for ${file.name}:`, uploadError)
          results.push({ name: file.name, documentId: '', success: false, error: 'Storage failed: ' + uploadError.message })
          continue
        }

        // 3. Get Public URL for the newly uploaded safe path
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(safeStoragePath)

        // 4. Extract Text
        let extractedText = ''
        if (file.type === 'application/pdf') {
          const pdfData = await pdf(buffer)
          extractedText = pdfData.text
        } else {
          extractedText = buffer.toString('utf-8')
        }

        if (!extractedText.trim()) {
          results.push({ name: file.name, documentId: '', success: false, error: 'No text extracted' })
          continue
        }

        // 5. Insert Document Record (Saving original name for UI + safe path for storage)
        const documentId = uuidv4()
        const { error: insertDocError } = await supabase
          .from('documents')
          .insert({
            id: documentId,
            user_id: user.id,
            name: file.name, // Original name preserved for UI
            type: file.type,
            url: publicUrl, // Link to the safe storage path
          })

        if (insertDocError) {
          console.error(`Doc Insert Error for ${file.name}:`, insertDocError)
          results.push({ name: file.name, documentId: '', success: false, error: 'Database save failed' })
          continue
        }

        // 6. Chunk Text and Save (Zero-vector for no-OpenAI flow)
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        })
        const chunks = await textSplitter.createDocuments([extractedText])

        const chunksToInsert = chunks.map((chunk: any, index: number) => ({
          document_id: documentId,
          content: chunk.pageContent,
          metadata: { ...chunk.metadata, pageNumber: index + 1 },
          embedding: new Array(1536).fill(0), 
        }))

        const BATCH_SIZE = 50
        for (let i = 0; i < chunksToInsert.length; i += BATCH_SIZE) {
          const batch = chunksToInsert.slice(i, i + BATCH_SIZE)
          const { error: insertChunksError } = await supabase
            .from('document_chunks')
            .insert(batch)

          if (insertChunksError) {
            console.error(`Chunks Error for ${file.name}:`, insertChunksError)
            results.push({ name: file.name, documentId: '', success: false, error: 'Vector save failed' })
            break
          }
        }

        if (!results.find(r => r.name === file.name && !r.success)) {
          results.push({ name: file.name, documentId, success: true })
        }
      } catch (err: any) {
        console.error(`Processing error for ${file.name}:`, err)
        results.push({ name: file.name, documentId: '', success: false, error: err.message || 'Processing failed' })
      }
    }

    const allSucceeded = results.every(r => r.success)
    return NextResponse.json({
      success: allSucceeded,
      results,
    }, { status: allSucceeded ? 200 : 207 })

  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown server error' }, { status: 500 })
  }
}
