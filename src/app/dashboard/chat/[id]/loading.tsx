import { Loader2, Bot } from 'lucide-react'

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] rounded-[2rem] relative bg-card/40 backdrop-blur-3xl border border-border shadow-2xl overflow-hidden mx-2 md:mx-4 mb-4 items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-20 h-20 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-xl">
          <Bot size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold uppercase tracking-tighter">Hydrating Neural Session</h2>
          <div className="flex items-center justify-center gap-3">
             <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary-dark)]" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Syncing Knowledge Base...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
