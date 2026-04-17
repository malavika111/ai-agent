import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FileText, Plus, ArrowRight, MessageSquare } from 'lucide-react'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'
import * as motion from 'framer-motion/client'
import DeleteDocumentButton from '@/components/dashboard/DeleteDocumentButton'
import ChatHistoryItem from '@/components/dashboard/ChatHistoryItem'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch user docs (knowledge bases)
  const { data: documents } = await supabase
    .from('documents')
    .select('id, name, type, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
    
  // Fetch unified chats
  const { data: chats } = await supabase
    .from('chats')
    .select('id, user_message, ai_response, created_at')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <PageEntrance>
      {/* Client-side prefetcher for ultra-fast transitions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="hidden">
         {/* Hidden prefetch logic can go here if needed, but Next.js Link handles most of it */}
      </motion.div>
      <div className="p-6 md:p-10 max-w-6xl mx-auto overflow-y-auto h-full scroll-smooth no-scrollbar">
        <div className="mb-10">
          <h1 className="text-3xl font-[800] tracking-[-0.05em] uppercase text-foreground font-heading">Dashboard</h1>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 leading-relaxed font-sans">
            Manage your knowledge base and interact with the AI assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Knowledge Bases Widget */}
          <div className="bg-card/70 backdrop-blur-3xl rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden flex flex-col card-hover-effect hover:bg-card/80">
            <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-3 font-heading uppercase tracking-[-0.02em]">
                <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-xl">
                  <FileText size={20} />
                </div>
                Recent Documents
              </h2>
              <Link 
                href="/dashboard/documents" 
                className="p-2.5 bg-[var(--color-pastel-green)]/10 text-[var(--color-pastel-green-dark)] hover:bg-[var(--color-pastel-green)]/20 rounded-xl transition-all btn-hover-effect"
                title="Upload new document"
              >
                <Plus size={18} />
              </Link>
            </div>
            <div className="p-8 flex-1">
              {documents && documents.length > 0 ? (
                <ul className="space-y-4">
                  {documents.map((doc, i) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={doc.id} 
                      className="flex items-center gap-2"
                    >
                      <Link href={`/dashboard/chat?doc=${doc.id}`} className="flex-1 flex flex-col p-4 rounded-2xl bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-all border border-transparent hover:border-foreground/10 group cursor-pointer">
                        <span className="font-bold text-sm truncate group-hover:text-[var(--color-primary-dark)]">{doc.name}</span>
                        <span className="text-[10px] text-foreground/30 font-black uppercase tracking-widest mt-1.5">{new Date(doc.created_at).toLocaleDateString()} &middot; {doc.type.split('/')[1]?.toUpperCase() || doc.type}</span>
                      </Link>
                      <DeleteDocumentButton documentId={doc.id} />
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-foreground/20 py-12 scale-90">
                  <FileText size={60} strokeWidth={0.5} className="mb-4 opacity-10" />
                  <p className="text-sm font-semibold">No documents uploaded yet.</p>
                  <Link href="/dashboard/documents" className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] hover:underline">
                    Upload Document
                  </Link>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-foreground/5 bg-foreground/[0.01]">
              <Link href="/dashboard/documents" className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:text-foreground/60 transition-all link-hover-effect group">
                View all repositories <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
            </div>
          </div>

          {/* Chat History Widget */}
          <div className="bg-card/70 backdrop-blur-3xl rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden flex flex-col card-hover-effect hover:bg-card/80">
            <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-3 font-heading uppercase tracking-[-0.02em]">
                <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-xl">
                  <MessageSquare size={20} />
                </div>
                Chat History
              </h2>
              <Link 
                href="/dashboard/chat" 
                className="p-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/20 rounded-xl transition-all btn-hover-effect"
                title="New Chat"
              >
                <Plus size={18} />
              </Link>
            </div>
            <div className="p-8 flex-1">
              {chats && chats.length > 0 ? (
                <ul className="space-y-4">
                  {chats.map((chat, i) => (
                    <ChatHistoryItem key={chat.id} chat={chat} index={i} />
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-foreground/20 py-12 scale-90">
                  <MessageSquare size={60} strokeWidth={0.5} className="mb-4 opacity-10" />
                  <p className="text-sm font-semibold">No active history.</p>
                  <Link href="/dashboard/chat" className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary-dark)] hover:underline">
                    New Question
                  </Link>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-foreground/5 bg-foreground/[0.01]">
              <Link href="/dashboard/chat" className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:text-foreground/60 transition-all link-hover-effect group">
                Open Chat <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageEntrance>
  )
}
