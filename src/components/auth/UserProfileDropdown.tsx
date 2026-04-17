'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'
import { signout } from '@/app/login/actions'
import { useRouter } from 'next/navigation'

interface UserProfileDropdownProps {
  userEmail?: string
}

export function UserProfileDropdown({ userEmail }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/5 py-2 pl-2 pr-4 rounded-full transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-pastel-red)] flex items-center justify-center text-white shadow-lg overflow-hidden ring-2 ring-white/20">
          <User size={16} />
        </div>
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/80">Authorized Node</span>
          <span className="text-[8px] text-foreground/40 font-mono truncate max-w-[100px]">{userEmail}</span>
        </div>
        <ChevronDown size={14} className={`text-foreground/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-56 bg-card/90 backdrop-blur-3xl border border-foreground/5 rounded-3xl shadow-2xl z-[100] p-3 overflow-hidden origin-top-right"
          >
            <div className="space-y-1">
              {/* Dashboard removed as requested */}
              
              <button 
                onClick={() => {
                  setIsOpen(false)
                  router.push('/profile')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-foreground/5 transition-all group text-left"
              >
                <ShieldCheck size={16} className="text-foreground/30 group-hover:text-[var(--color-primary)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 group-hover:text-foreground">View Profile</span>
              </button>
              
              <div className="h-px bg-foreground/5 my-2 mx-2" />
              
              <button 
                onClick={async () => {
                  setIsOpen(false)
                  await signout()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 transition-all group text-left"
              >
                <LogOut size={16} className="text-foreground/30 group-hover:text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 group-hover:text-red-500">System Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
