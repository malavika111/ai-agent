'use client'

import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'
import { User, Shield, Zap, Trash2, LogOut, ChevronRight, Loader2, AlertTriangle, X } from 'lucide-react'
import { signout } from '@/app/login/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsClientPage({ 
  user 
}: { 
  user: { email: string; id: string } 
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setShowConfirmModal(false) // Close modal before starting fetch
    
    try {
      const res = await fetch('/api/delete-account', { 
        method: 'DELETE', 
        credentials: 'include' 
      })
      
      if (res.ok) {
        window.location.href = '/'
      } else {
        const data = await res.json()
        alert('Deletion failed: ' + (data.error || 'Server error'))
      }
    } catch (err) {
      console.error(err)
      alert('Network error occurred during deletion.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageEntrance>
      <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-12">
        <header>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Account Settings</h1>
          <p className="text-foreground/50 text-sm font-medium uppercase tracking-widest">Workspace Configuration v2.0</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Profile Section */}
          <section className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border/50 shadow-xl space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white shadow-2xl">
                  <User size={40} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Identity Profile</h3>
                  <p className="text-sm text-foreground/40">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-foreground/5 border border-transparent hover:border-foreground/10 transition-all group pointer-events-none opacity-60">
                  <div className="flex items-center gap-4">
                    <Shield size={20} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Access Tier</p>
                      <p className="text-sm font-medium">Standard Integration</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="opacity-20" />
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-foreground/5 border border-transparent hover:border-foreground/10 transition-all group pointer-events-none opacity-60">
                  <div className="flex items-center gap-4">
                    <Zap size={20} className="text-yellow-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Neural Engine</p>
                      <p className="text-sm font-medium">Groq Llama 3.3 (Active)</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="opacity-20" />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-red-500/5 backdrop-blur-3xl border border-red-500/10 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                  <Trash2 size={20} />
                  Danger Zone
                </h3>
                <p className="text-xs text-red-500/60 font-medium mt-1">Irreversible account modifications</p>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isDeleting}
                  className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 text-sm font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-30 flex items-center gap-3"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  {isDeleting ? 'Erasing Workspace...' : 'Request Data Erasure'}
                </button>
              </div>
            </div>
          </section>

          {/* Sidebar Actions */}
          <aside className="space-y-6">
            <div className="p-6 rounded-[2rem] bg-card/60 backdrop-blur-2xl border border-border/50 shadow-lg space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 px-2">Quick Actions</h4>
              
              <button 
                onClick={() => signout()}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-foreground/5 hover:bg-red-500/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 text-red-500">
                  <LogOut size={18} />
                  <span className="text-xs font-bold">Sign Out Session</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </button>
            </div>

            <div className="p-6 rounded-[2rem] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-dark)] mb-2">Build Entropy</p>
              <div className="h-1 w-full bg-[var(--color-primary)]/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-[var(--color-primary)] rounded-full"></div>
              </div>
              <p className="text-[9px] font-medium opacity-50 mt-3 italic">Melova AI Platform © 2026</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-xl transition-all"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-card/90 backdrop-blur-3xl border border-border rounded-[3rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="p-3 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all active:scale-90"
                >
                  <X size={20} className="opacity-40" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-[2.5rem] bg-red-500/10 text-red-500 flex items-center justify-center shadow-inner">
                  <AlertTriangle size={40} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight uppercase">Terminal Action</h2>
                  <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.3em]">Absolute Data Erasure</p>
                </div>

                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 text-sm leading-relaxed max-w-sm">
                  You are about to permanently delete your identity node. This will erase all documents, chat logs, and vector metadata from the network.
                  <span className="block mt-4 font-bold text-red-500 uppercase tracking-widest text-[9px]">Status: Irreversible</span>
                </div>

                <div className="flex flex-col w-full gap-4 pt-4">
                  <button 
                    onClick={handleDeleteAccount}
                    className="w-full py-5 rounded-[2rem] bg-red-500 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Trash2 size={18} />
                    Execute Deletion
                  </button>
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full py-5 rounded-[2rem] bg-foreground/5 font-black uppercase tracking-[0.2em] text-[10px] opacity-40 hover:opacity-100 transition-all active:scale-95"
                  >
                    Abort Sequence
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageEntrance>
  )
}
