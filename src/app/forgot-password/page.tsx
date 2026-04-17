'use client'

import { useState, Suspense } from 'react'
import { sendPasswordResetEmail } from '../login/actions'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Mail, Loader2, ArrowLeft } from 'lucide-react'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'
import Link from 'next/link'

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await sendPasswordResetEmail(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageEntrance>
      <div className="flex min-h-screen items-center justify-center p-6 md:p-8 relative overflow-hidden bg-transparent">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="bg-card/70 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 border border-border md:border-foreground/5 shadow-2xl relative overflow-hidden">
            <div className="mb-8 absolute top-8 left-8">
              <Link href="/login" className="text-foreground/40 hover:text-foreground transition-colors flex items-center pr-2 py-1">
                <ArrowLeft size={20} />
              </Link>
            </div>
            
            <div className="mb-14 text-center mt-6">
              <motion.div 
                whileHover={{ rotate: [0, 5, -5, 0], scale: 1.1 }}
                className="w-20 h-20 bg-[var(--color-primary)] text-white rounded-3xl mx-auto mb-10 flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/20 relative"
              >
                <KeyRound size={40} />
                <motion.div 
                   animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="absolute -inset-4 border-2 border-[var(--color-primary)]/10 rounded-[2.5rem] pointer-events-none"
                />
              </motion.div>
              <h1 className="text-3xl font-[800] tracking-[-0.05em] uppercase text-foreground mb-4 font-heading">
                RESET PASSWORD
              </h1>
              <p className="text-xs font-bold text-foreground/40 mt-2 uppercase tracking-wide">
                Enter your email address to receive a reset link.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                   className="mb-8"
                >
                  <div className="rounded-2xl bg-red-600/90 text-white p-4 text-[9px] font-black uppercase tracking-[0.3em] text-center shadow-xl">
                    {error}
                  </div>
                </motion.div>
              )}
              {message && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                   className="mb-8"
                >
                  <div className="rounded-2xl bg-green-600/90 text-white p-4 text-[9px] font-black uppercase tracking-[0.3em] text-center shadow-xl">
                    {message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                  <Mail size={12} /> EMAIL
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="pt-8">
                <motion.button
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full rounded-2xl bg-foreground text-white dark:text-[#0f172a] py-5 text-[11px] font-black uppercase tracking-[0.5em] shadow-xl hover:shadow-[var(--color-primary)]/20 transition-all flex items-center justify-center gap-4 relative z-20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-white dark:text-[#0f172a]" />
                  ) : (
                    <>
                      <Mail size={18} />
                      <span>SEND RESET LINK</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </PageEntrance>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin opacity-10" /></div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
