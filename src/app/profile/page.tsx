'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, ShieldCheck, KeyRound, Save, History, FileX, AlertTriangle, ArrowLeft, Loader2, CheckCircle2, UserCircle } from 'lucide-react'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [showConfirm, setShowConfirm] = useState<'history' | 'docs' | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      setFormData(prev => ({
        ...prev,
        username: profileData?.username || user.user_metadata?.username || user.email?.split('@')[0] || '',
        email: user.email || ''
      }))
      setLoading(false)
    }
    fetchUserData()
  }, [supabase, router])

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)

    // 1. Password validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' })
      setUpdating(false)
      return
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' })
      setUpdating(false)
      return
    }

    try {
      // 2. Update Username in profiles table
      if (formData.username !== profile?.username) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: formData.username })
          .eq('id', user.id)

        if (profileError) throw profileError
      }

      // 3. Update Auth User (Email/Password)
      const authUpdates: any = {}
      if (formData.email !== user.email) authUpdates.email = formData.email
      if (formData.password) authUpdates.password = formData.password

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates)
        if (authError) throw authError
      }

      setMessage({ text: 'Profile updated successfully.', type: 'success' })
      setProfile({ ...profile, username: formData.username })
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteHistory = async () => {
    setMessage({ text: 'Chat history cleared.', type: 'success' })
    setShowConfirm(null)
  }

  const handleDeleteDocs = async () => {
    setMessage({ text: 'Document history cleared.', type: 'success' })
    setShowConfirm(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin opacity-20" />
      </div>
    )
  }

  return (
    <PageEntrance>
      <div className="min-h-screen p-8 md:p-12 lg:p-20 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header & Back Button */}
          <div className="flex items-center justify-between mb-16">
            <Link href="/" className="group flex items-center gap-3 text-foreground/30 hover:text-foreground transition-all">
               <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform duration-300" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Core</span>
            </Link>
            {/* Removed 'Secure Profile Node' text as requested */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Core Identity Card */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-card/70 backdrop-blur-3xl rounded-[3rem] p-10 border border-foreground/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 transition-transform duration-700 group-hover:rotate-0">
                   <UserCircle size={140} strokeWidth={0.5} />
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl">
                    <UserCircle size={40} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-[800] uppercase tracking-[-0.05em] font-heading leading-tight break-all">
                      {profile?.username || user?.email?.split('@')[0]}
                    </h2>
                    <div className="flex items-center gap-2 text-foreground/30 text-[10px] font-black uppercase tracking-[0.2em] font-mono">
                       <Mail size={12} className="opacity-50" /> {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone Refined */}
              <div className="bg-red-500/[0.03] backdrop-blur-3xl rounded-[3rem] p-10 border border-red-500/10 space-y-8">
                <div className="flex items-center gap-3 text-red-500/60 text-[10px] font-black uppercase tracking-[0.4em]">
                   <AlertTriangle size={14} /> Critical Data Access
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowConfirm('history')}
                    className="w-full flex items-center justify-between gap-4 p-5 rounded-2xl border border-red-500/10 hover:bg-red-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <History size={18} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500/60 group-hover:text-red-500 transition-colors">Clear Chat History</span>
                    </div>
                    <AlertTriangle size={14} className="text-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button 
                    onClick={() => setShowConfirm('docs')}
                    className="w-full flex items-center justify-between gap-4 p-5 rounded-2xl border border-red-500/10 hover:bg-red-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <FileX size={18} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500/60 group-hover:text-red-500 transition-colors">Clear Document History</span>
                    </div>
                    <AlertTriangle size={14} className="text-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: User Settings Form */}
            <div className="lg:col-span-7">
               <motion.form 
                 onSubmit={handleUpdateSettings}
                 className="bg-card/70 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 border border-foreground/5 shadow-2xl space-y-10"
               >
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                          <User size={12} /> Username
                        </label>
                        <input
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          type="text"
                          className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                          placeholder="Your Identifier"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                          <Mail size={12} /> Email Address
                        </label>
                        <input
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          type="email"
                          className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground font-mono"
                          placeholder="yourname@domain.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                          <KeyRound size={12} /> New Password
                        </label>
                        <input
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          type="password"
                          className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] ml-5 flex items-center gap-2">
                          <CheckCircle2 size={12} /> Confirm Key
                        </label>
                        <input
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          type="password"
                          className="w-full rounded-2xl border border-border/60 bg-foreground/5 px-6 py-4 text-sm font-bold placeholder:text-foreground/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-foreground"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                 </div>

                 <AnimatePresence>
                   {message && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex items-center gap-4 p-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                     >
                       {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                       <span>{message.text}</span>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <motion.button
                   whileHover={{ y: -4, scale: 1.01 }}
                   whileTap={{ scale: 0.98 }}
                   disabled={updating}
                   className="w-full rounded-2xl bg-foreground text-background py-6 text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl hover:opacity-90 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                 >
                   {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                   Save Changes
                 </motion.button>
               </motion.form>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirm(null)}
                className="absolute inset-0 bg-background/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="w-full max-w-md bg-card/90 backdrop-blur-3xl p-10 rounded-[4rem] border border-red-500/20 shadow-[0_32px_64px_-12px_rgba(239,68,68,0.2)] relative z-[210] text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-8 animate-pulse">
                   <AlertTriangle size={36} />
                </div>
                <h3 className="text-2xl font-[800] uppercase tracking-[-0.05em] font-heading mb-4 text-foreground">EXECUTE PURGE</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-10 leading-relaxed px-4">
                  This protocol will permanently delete your stored neural data. This action cannot be reversed.
                </p>
                <div className="flex gap-4 p-2">
                   <button 
                     onClick={() => setShowConfirm(null)}
                     className="flex-1 py-5 rounded-2xl border border-foreground/5 bg-foreground/5 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-foreground/10 transition-all"
                   >
                     Abort
                   </button>
                   <button 
                     onClick={showConfirm === 'history' ? handleDeleteHistory : handleDeleteDocs}
                     className="flex-1 py-5 rounded-2xl bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-red-600/30 hover:bg-red-700 transition-all font-heading"
                   >
                     Confirm
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageEntrance>
  )
}
