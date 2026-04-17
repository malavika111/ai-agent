'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    
    try {
      const res = await fetch('/api/deleteDocument', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete document from server")
      }

      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error("Delete process caught error:", err)
      setError(err.message || "An unexpected network or server error occurred")
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all self-center ml-auto disabled:opacity-50 group"
        title="Delete Document"
      >
        <Trash2 size={18} className="transition-transform group-hover:scale-110" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card/90 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-red-500/20">
                    <Trash2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold font-heading uppercase tracking-tight mb-2">Delete Document</h3>
                  <p className="text-sm font-semibold text-foreground/60 mb-8 px-2 font-sans">
                    Are you sure you want to delete this document? This action cannot be undone.
                  </p>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="mb-6 p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl w-full flex flex-col gap-2 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <span className="text-xs font-black uppercase tracking-widest">Error</span>
                      </div>
                      <p className="text-sm font-medium pl-8 leading-snug">{error}</p>
                    </motion.div>
                  )}

                  <div className="flex w-full gap-4">
                    <button 
                      onClick={() => setIsOpen(false)}
                      disabled={isDeleting}
                      className="flex-1 py-3.5 px-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-foreground/[0.03] border border-foreground/5 hover:bg-foreground/[0.08] transition-all disabled:opacity-50 focus:ring-2 focus:ring-foreground/20 outline-none"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center py-3.5 px-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 focus:ring-2 focus:ring-red-500/50 outline-none"
                    >
                      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
