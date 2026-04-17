'use client'

import { Bot, User, Send, Loader2, FileText, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'
import { motion, AnimatePresence } from 'framer-motion'

interface Document {
  id: string
  name: string
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function ChatInterface({
  initialMessages = [],
  initialDocumentId,
  initialInput,
}: {
  initialMessages?: Message[]
  initialDocumentId?: string
  initialInput?: string
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState(initialInput || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(initialDocumentId || 'all')
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDocs = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name')
        .order('name')
      
      if (!error && data) {
        setDocuments(data)
        if (initialDocumentId) {
          setSelectedDocumentId(initialDocumentId)
        }
      }
    }
    fetchDocs()
  }, [supabase, initialDocumentId])

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const customSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    setError(null)
    const userMessageContent = input.trim()
    setInput('')
    
    // Add user message to UI immediately
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: userMessageContent
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // 2. Fetch AI Response (Full payload, no streaming)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          documentId: selectedDocumentId === 'all' ? undefined : selectedDocumentId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Network error')
      }

      const data = await response.json()
      
      // 3. Add AI message to UI
      const aiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.content
      }
      setMessages(prev => [...prev, aiMessage])

    } catch (err: any) {
      setError(err.message || 'AI failed to respond.')
    } finally {
      setIsLoading(false)
    }
  }

  const isProcessing = isLoading

  return (
    <PageEntrance>
      <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] rounded-[2rem] relative bg-card/40 backdrop-blur-3xl border border-border shadow-2xl overflow-hidden mx-2 md:mx-4 mb-4">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--color-primary)]/20 text-[var(--color-primary-dark)] rounded-2xl flex items-center justify-center shadow-inner">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-tight">Neural Assistant</h3>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Matrix v4.2.0</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
              className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-white/10 transition-all active:scale-95 shadow-sm"
            >
              <FileText size={16} className="text-[var(--color-primary-dark)]" />
              <span className="max-w-[150px] truncate">
                {selectedDocumentId === 'all' 
                  ? 'All Documents' 
                  : documents.find(d => d.id === selectedDocumentId)?.name || 'Syncing Node...'}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-500 ${isDocDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDocDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsDocDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 mt-3 w-64 bg-[#f8fafc]/90 dark:bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl z-40 py-3 overflow-hidden ring-1 ring-black/5"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                       <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em]">Context Source</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                      <button
                        onClick={() => { setSelectedDocumentId('all'); setIsDocDropdownOpen(false) }}
                        className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase transition-all hover:bg-white/10 ${selectedDocumentId === 'all' ? 'text-[var(--color-primary-dark)] bg-white/10' : 'text-foreground/60'}`}
                      >
                        Global Knowledge Base
                      </button>
                      {documents.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => { setSelectedDocumentId(doc.id); setIsDocDropdownOpen(false) }}
                          className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase transition-all hover:bg-white/10 truncate ${selectedDocumentId === doc.id ? 'text-[var(--color-primary-dark)] bg-white/10' : 'text-foreground/60'}`}
                        >
                          {doc.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 no-scrollbar scroll-smooth relative">
          {(!messages || messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-20 h-20 bg-[var(--color-primary)]/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/10">
                <Bot size={40} strokeWidth={1} />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">Neural Link Active</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] max-w-sm leading-relaxed">
                Awaiting input to begin contextual synthesis from your knowledge base.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message: any) => {
                const isUser = message.role === 'user'
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={message.id} 
                    className={`flex gap-6 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-all duration-500 ${
                      isUser ? 'bg-[var(--color-primary)] text-white rotate-3 hover:rotate-0' : 'bg-white/10 border border-white/10 text-[var(--color-primary-dark)] -rotate-3 hover:rotate-0'
                    }`}>
                      {isUser ? <User size={22} /> : <Bot size={22} />}
                    </div>
                    <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-xl border transition-all ${
                        isUser
                          ? 'bg-[var(--color-primary)] text-white border-transparent rounded-tr-none'
                          : 'bg-white/10 backdrop-blur-2xl border-white/10 text-foreground rounded-tl-none'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em] px-4">
                        {isUser ? 'Neural Signature' : 'Core Response'}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
              
              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 max-w-4xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 text-[var(--color-primary-dark)] flex items-center justify-center shadow-lg animate-pulse">
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                  <div className="px-8 py-5 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center gap-3 shadow-xl">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full" />
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} className="h-20" />
        </div>

        {/* Input area */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-background via-background/80 to-transparent relative z-10">
          <form
            onSubmit={customSubmit}
            className="max-w-4xl mx-auto relative flex items-end gap-3 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 shadow-2xl focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 transition-all hover:bg-white/[0.15]"
          >
            <textarea
              className="flex-1 max-h-40 min-h-[56px] bg-transparent resize-none px-6 py-4 outline-none text-sm font-medium disabled:opacity-50 no-scrollbar placeholder:text-foreground/20"
              placeholder={selectedDocumentId !== 'all' ? "Query this document..." : "Ask the global network..."}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  customSubmit(e)
                }
              }}
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="p-4 mb-1.5 mr-1.5 rounded-2xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all shadow-lg active:scale-90 disabled:opacity-30 flex items-center justify-center"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>

        {/* Error overlay */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 backdrop-blur-3xl border border-red-500/30 px-8 py-4 rounded-[2rem] flex items-center gap-4 text-red-500 shadow-2xl"
            >
              <Loader2 className="w-5 h-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageEntrance>
  )
}
