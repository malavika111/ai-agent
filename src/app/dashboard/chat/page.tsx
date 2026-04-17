import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function NewChatPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ doc?: string, q?: string }> 
}) {
  const { doc, q } = await searchParams
  return (
    <div className="h-full">
      <ChatInterface initialDocumentId={doc} initialInput={q} />
    </div>
  )
}
