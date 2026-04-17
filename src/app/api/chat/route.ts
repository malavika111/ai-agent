import { createClient } from '@/utils/supabase/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { messages, sessionId, documentId } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 })
    }

    const latestMessage = messages[messages.length - 1]
    const query = latestMessage.content || ''

    // 1. Fetch relevant document chunks
    let searchResult;
    if (documentId && documentId !== 'all') {
      searchResult = await supabase
        .from('document_chunks')
        .select('content, metadata, document_id')
        .eq('document_id', documentId)
        .limit(10)
    } else {
      const { data: userDocs } = await supabase.from('documents').select('id').eq('user_id', user.id)
      const docIds = userDocs?.map(d => d.id) || []
      
      searchResult = await supabase
        .from('document_chunks')
        .select('content, metadata, document_id')
        .in('document_id', docIds)
        .order('id', { ascending: false })
        .limit(8)
    }

    const { data: chunks, error: fetchError } = searchResult;

    if (fetchError) {
      console.error('Text Fetch Error:', fetchError)
    }

    // 2. Build RAG Context
    let contextStr = ''
    let sourceMeta: string[] = []

    if (chunks && chunks.length > 0) {
      const docIds = Array.from(new Set(chunks.map((c: any) => c.document_id)))
      const { data: docs } = await supabase.from('documents').select('id, name').in('id', docIds)
      const docMap = new Map(docs?.map(d => [d.id, d.name]) || [])

      contextStr = chunks
        .map((chunk: any) => {
          const docName = docMap.get(chunk.document_id) || 'Neural Node'
          sourceMeta.push(docName)
          const cleanContent = chunk.content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().substring(0, 1500)
          return `[Source: ${docName}]\n${cleanContent}`
        })
        .join('\n\n---\n\n')
        .substring(0, 3000)

      sourceMeta = Array.from(new Set(sourceMeta))
    }

    // 3. Hybrid System Prompt: Document-First with fallback to General Knowledge
    const systemPrompt = `You are a helpful AI Assistant.

Rules:
1. First try to answer using ONLY the provided document context below.
2. If the answer is found in the document, respond using that information and cite the document name.
3. If the answer is NOT found in the document context:
   - Clearly say: "📄 This information is not available in the uploaded document." 
   - Then say: "🌐 However, here is a general answer based on my knowledge:"
   - Then provide a detailed, helpful answer using your internal knowledge.
4. Always be clear whether the information is from the document or from your general knowledge.
5. Maintain a professional and intelligent tone.

Document Context:
${contextStr || 'No document context available for this user yet.'}`

    // 4. Removed User Message Saving 

    const chatMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: chatMessages,
    })

    // 6. Save unified chat record
    const { error: chatSaveError } = await supabase.from('chats').insert({
      user_id: user.id,
      user_message: query,
      ai_response: text
    })
    
    if (chatSaveError) {
      console.error('Failed to save to unified chats table:', chatSaveError)
    }

    return new Response(JSON.stringify({ 
      role: 'assistant', 
      content: text,
      sources: sourceMeta
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('Groq Hybrid API Error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
