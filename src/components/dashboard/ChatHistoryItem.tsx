'use client'

import { useState } from 'react'
import { Trash2, Loader2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ChatHistoryItem({ chat, index }: { chat: any, index: number }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this chat record?")) return

    setIsDeleting(true)
    try {
      const res = await fetch('/api/deleteChat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chat.id })
      })

      if (!res.ok) throw new Error("Failed to delete")

      router.refresh()
    } catch (err) {
      console.error(err)
      setIsDeleting(false)
    }
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <motion.li 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 + 0.1 }}
      className="flex flex-col p-4 rounded-2xl bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all border border-transparent hover:border-foreground/10 group shadow-sm overflow-hidden"
    >
        <div className="flex items-start justify-between gap-4 mb-2">
            <Link href={`/dashboard/chat?q=${encodeURIComponent(chat.user_message)}`} className="flex-1 font-bold text-sm leading-snug group-hover:text-[var(--color-primary-dark)] transition-colors">
                {chat.user_message}
            </Link>
            <div className="flex items-center gap-[2px]">
                <button
                    onClick={handleExpand}
                    className="p-1.5 text-foreground/30 hover:text-foreground/70 rounded-xl hover:bg-foreground/5 transition-all outline-none"
                    title="Expand Response"
                >
                    <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-foreground/30 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-all z-10 relative outline-none"
                    title="Delete Chat"
                >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
            </div>
        </div>

        <div className={`text-xs text-foreground/70 leading-relaxed transition-all duration-500 cursor-pointer relative ${expanded ? '' : 'line-clamp-2 hover:line-clamp-3'}`} onClick={handleExpand}>
            <span className="font-extrabold text-[10px] uppercase tracking-widest text-[var(--color-primary)] mr-2 bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-md">Bot</span>
            {chat.ai_response}
        </div>

        <div className="mt-4 pt-3 border-t border-foreground/[0.03] text-[9px] text-foreground/35 font-black uppercase tracking-widest flex items-center justify-between">
            <span>{new Date(chat.created_at).toLocaleDateString()}</span>
            <Link href={`/dashboard/chat?q=${encodeURIComponent(chat.user_message)}`} className="text-[var(--color-primary-dark)] hover:opacity-70 transition-opacity z-10 relative bg-[var(--color-primary)]/10 px-2 py-1 rounded-lg">
                Reuse Prompt
            </Link>
        </div>
    </motion.li>
  )
}
