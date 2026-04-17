'use client'

import { useState, Suspense } from 'react'
import { login, signup, signInWithGoogle } from './actions'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, LogIn, UserPlus, Lock, KeyRound, ShieldCheck, Loader2, Mail, Eye, EyeOff, User } from 'lucide-react'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const action = isLogin ? login : signup
      await action(formData)
    } catch (err) {
      console.error("Auth action failed:", err)
      // The redirect in the server action usually prevents this, 
      // but if the fetch fails completely (like a timeout), we handle it here.
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
            <div className="mb-14 text-center">
              <motion.div 
                whileHover={{ rotate: [0, 5, -5, 0], scale: 1.1 }}
                className="w-20 h-20 bg-[var(--color-primary)] text-white rounded-3xl mx-auto mb-10 flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/20 relative"
              >
                {isLogin ? <Fingerprint size={40} /> : <UserPlus size={40} />}
                <motion.div 
                   animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="absolute -inset-4 border-2 border-[var(--color-primary)]/10 rounded-[2.5rem] pointer-events-none"
                />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-[800] tracking-[-0.05em] uppercase text-foreground mb-4 font-heading">
                {isLogin ? 'WELCOME TO MELOVA' : 'CREATE ACCOUNT'}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="mb-8"
                >
                  <div className="rounded-2xl bg-red-600/90 text-white p-4 text-[9px] font-black uppercase tracking-[0.3em] text-center shadow-xl flex items-center justify-center gap-3">
                    <Lock size={14} /> {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                    <User size={12} /> USERNAME
                  </label>
                  <input
                    name="username"
                    type="text"
                    required={!isLogin}
                    className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                    placeholder="Create a unique username"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                  <Mail size={12} /> {isLogin ? 'USERNAME OR EMAIL' : 'EMAIL'}
                </label>
                <input
                  name="email"
                  type={isLogin ? "text" : "email"}
                  required
                  className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                  placeholder={isLogin ? "Enter your username or email" : "Enter your email address"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                  <ShieldCheck size={12} /> PASSWORD
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full rounded-2xl border border-border/60 bg-foreground/5 pl-6 pr-12 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/60 transition-all p-1"
                    title={showPassword ? "Hide password" : "Show password"}
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
                {isLogin && (
                  <div className="flex justify-end pr-2 pt-1">
                    <a href="/forgot-password" className="text-[10px] font-bold text-foreground/40 hover:text-foreground transition-colors uppercase tracking-widest">
                      Forgot Password?
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <motion.button
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full rounded-2xl bg-foreground text-white dark:text-[#0f172a] py-5 text-[11px] font-black uppercase tracking-[0.5em] shadow-xl hover:shadow-[var(--color-primary)]/20 transition-all flex items-center justify-center gap-4 relative z-20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-white" />
                  ) : (
                    <>
                      {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                      <span>{isLogin ? 'SIGN IN' : 'SIGN UP'}</span>
                    </>
                  )}
                </motion.button>
                
                <div className="mt-6 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        // Clear error parameter when switching modes
                        const url = new URL(window.location.href)
                        url.searchParams.delete('error')
                        window.history.replaceState({}, '', url)
                      }}
                      className="ml-2 text-foreground/60 hover:text-foreground transition-all underline decoration-foreground/20 underline-offset-4"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </div>
            </form>

            <div className="my-10 flex items-center gap-6">
              <div className="flex-1 h-px bg-foreground/5"></div>
              <div className="text-[9px] font-black text-foreground/10 uppercase tracking-[0.6em]">Secure SSO</div>
              <div className="flex-1 h-px bg-foreground/5"></div>
            </div>

            <motion.button
              whileHover={{ y: -2, scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signInWithGoogle()}
              className="flex w-full items-center justify-center gap-4 rounded-2xl border border-border/60 bg-transparent py-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground transition-all shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
              </svg>
              Continue with Google
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PageEntrance>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin opacity-10" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
