'use client'

import { signout } from '@/app/login/actions'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <motion.button
      whileHover={{ y: -2, opacity: 0.8 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => signout()}
      className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl hover:shadow-foreground/10"
    >
      <LogOut size={14} />
      Logout
    </motion.button>
  )
}
