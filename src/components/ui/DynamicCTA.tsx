'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowRight, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'

export function DynamicCTA() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true;
    
    // Use getSession for initial check to avoid race conditions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setUser(session?.user ?? null)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null)
    })
    
    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <Link 
      href={user ? "/dashboard" : "/login"}
      className="group relative"
    >
      <div className="absolute -inset-6 bg-[var(--color-primary)]/10 rounded-[3.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      <motion.div 
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center gap-6 bg-[var(--color-primary)] text-white px-16 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary-dark)] transition-all premium-btn"
      >
        {user ? (
          <>
            ACCESS DASHBOARD
            <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform duration-700" />
          </>
        ) : (
          <>
            <LogInIcon />
            LOGIN/SIGN UP
            <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform duration-700" />
          </>
        )}
      </motion.div>
    </Link>
  )
}

function LogInIcon() {
  return (
    <svg 
      className="w-5 h-5" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  )
}
