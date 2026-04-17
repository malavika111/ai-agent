'use client'

import { useState, Suspense } from 'react'
import { signup } from '../login/actions'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Lock, KeyRound, ShieldCheck, Loader2, Mail, User, Eye, EyeOff } from 'lucide-react'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'

function SignupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`
      }
    })
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError('')
    
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    setIsLoading(true)
    const form = new FormData()
    form.append('email', formData.email)
    form.append('password', formData.password)
    
    try {
      await signup(form)
    } catch (e) {
      setValidationError('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageEntrance>
      <div className="flex min-h-screen items-center justify-center p-6 md:p-8 relative overflow-hidden bg-transparent">
        {/* Subtle decorative login background (matched from login) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="bg-card/70 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 border border-border md:border-foreground/5 shadow-2xl relative overflow-hidden">
            <div className="mb-10 text-center">
              <motion.div 
                whileHover={{ rotate: [0, 5, -5, 0], scale: 1.1 }}
                className="w-20 h-20 bg-[var(--color-primary)] text-white rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/20 relative"
              >
                <UserPlus size={40} />
                <motion.div 
                   animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="absolute -inset-4 border-2 border-[var(--color-primary)]/10 rounded-[2.5rem] pointer-events-none"
                />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-[800] tracking-[-0.05em] uppercase text-foreground mb-4 font-heading">
                CREATE YOUR MELOVA ACCOUNT
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 px-6 leading-loose">
                Join and start interacting with your AI agent.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {(error || validationError) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="rounded-2xl bg-red-600/90 text-white p-4 text-[9px] font-black uppercase tracking-[0.3em] text-center shadow-xl flex items-center justify-center gap-3">
                    <Lock size={14} /> {error || validationError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                  <User size={12} /> FULL NAME
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                  <Mail size={12} /> EMAIL
                </label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                  placeholder="Enter your email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                    <KeyRound size={12} /> PASSWORD
                  </label>
                  <div className="relative group">
                    <input
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full rounded-2xl border border-border/60 bg-foreground/5 pl-6 pr-12 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/60 transition-all p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                    <ShieldCheck size={12} /> CONFIRM
                  </label>
                  <div className="relative group">
                    <input
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full rounded-2xl border border-border/60 bg-foreground/5 pl-6 pr-12 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/60 transition-all p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <motion.button
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full rounded-2xl bg-foreground text-background py-5 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                  SIGN UP
                </motion.button>
                
                <div className="mt-6 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                    Already have an account?
                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="ml-2 text-foreground/60 hover:text-foreground transition-all underline decoration-foreground/20 underline-offset-4"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            </form>

            <div className="my-8 flex items-center gap-6">
              <div className="flex-1 h-px bg-foreground/5"></div>
              <div className="text-[9px] font-black text-foreground/10 uppercase tracking-[0.6em]">Secure SSO</div>
              <div className="flex-1 h-px bg-foreground/5"></div>
            </div>

            <motion.button
              whileHover={{ y: -2, scale: 1.01, backgroundColor: 'rgba(0,0,0,0.02)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin opacity-10" /></div>}>
      <SignupContent />
    </Suspense>
  )
}
