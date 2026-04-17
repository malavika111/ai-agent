import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function DocumentChatPage({
  params,
}: {
  params: Promise<{ docId: string }>
}) {
  const { docId } = await params
  const supabase = await createClient()

  // 1. Verify document exists and belongs to user
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, name')
    .eq('id', docId)
    .single()

  if (docError || !document) {
    notFound()
  }

  // 2. Check if a session already exists for this document (or create a virtual one)
  // For the "Auto Redirect After Upload", we can either:
  // a) Start a fresh session
  // b) Find the most recent session
  
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-transparent">
       <ChatInterface initialDocumentId={docId} />
    </div>
  )
}
