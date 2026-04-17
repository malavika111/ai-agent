import { ChatInterface } from '@/components/chat/ChatInterface'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function ExistingChatPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ doc?: string }>
}) {
  const { id } = await params
  const { doc } = await searchParams
  const supabase = await createClient()

  // Fetch session to ensure it exists and belongs to user
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!session) {
    notFound()
  }

  // Fetch history from correct table
  const { data: messages } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('session_id', id)
    .order('created_at', { ascending: true })

  // Format messages for Vercel AI SDK
  const initialMessages = messages?.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  })) || []

  return (
    <div className="h-full">
      <ChatInterface
        initialMessages={initialMessages}
        initialDocumentId={doc}
      />
    </div>
  )
}
