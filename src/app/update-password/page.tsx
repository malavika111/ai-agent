'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Loader2, EyeOff, Eye } from 'lucide-react'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'

function UpdatePasswordContent() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  
  const [errorMsg, setErrorMsg] = useState<string | null>(errorParam)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Calling createClient mounts the implicit auth hash into the session
    // Server-side PKCE code verification already established the session prior to visiting this page if using the email link
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // SYNC read form data before any awaits so event doesn't nullify
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string

    setIsLoading(true)
    setErrorMsg(null)
    
    // Safety check BEFORE trying to update
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setErrorMsg("Authentication session is missing or expired. Please click the reset link in your email again.")
      setIsLoading(false)
      return
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setErrorMsg(error.message)
      } else {
        await supabase.auth.signOut()
        router.push('/login?message=' + encodeURIComponent('Password successfully updated'))
      }
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
            <div className="mb-14 text-center mt-6">
              <motion.div 
                whileHover={{ rotate: [0, 5, -5, 0], scale: 1.1 }}
                className="w-20 h-20 bg-[var(--color-primary)] text-white rounded-3xl mx-auto mb-10 flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/20 relative"
              >
                <ShieldCheck size={40} />
                <motion.div 
                   animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="absolute -inset-4 border-2 border-[var(--color-primary)]/10 rounded-[2.5rem] pointer-events-none"
                />
              </motion.div>
              <h1 className="text-3xl font-[800] tracking-[-0.05em] uppercase text-foreground mb-4 font-heading">
                NEW PASSWORD
              </h1>
              <p className="text-xs font-bold text-foreground/40 mt-2 uppercase tracking-wide">
                Enter your new secure password below.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                   className="mb-8"
                >
                  <div className="rounded-2xl bg-red-600/90 text-white p-4 text-[9px] font-black uppercase tracking-[0.3em] text-center shadow-xl">
                    {errorMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                  <ShieldCheck size={12} /> NEW PASSWORD
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full rounded-2xl border border-border/60 bg-foreground/5 pl-6 pr-12 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                    placeholder="Create a new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/60 transition-all p-1"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={showPassword ? 'eye-off' : 'eye'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
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
                      <ShieldCheck size={18} />
                      <span>DONE</span>
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

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin opacity-10" /></div>}>
      <UpdatePasswordContent />
    </Suspense>
  )
}
