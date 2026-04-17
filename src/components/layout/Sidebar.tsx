'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signout } from '@/app/login/actions'
import { 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/dashboard/documents', label: 'Documents', icon: FileText },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card/60 backdrop-blur-xl border-b border-border z-40 sticky top-0">
        <Link 
          href="/" 
          className="font-bold text-lg flex items-center gap-2 hover-blur transition-all"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold shadow-md">AI</div>
          Agent
        </Link>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 btn-hover-effect">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar styling */}
      <motion.div 
        initial={false}
        animate={{ x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -256 : 0) }}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card/70 backdrop-blur-3xl border-r border-border transition-none md:relative md:translate-x-0
          flex flex-col shadow-2xl md:shadow-none
        `}
      >
        <div className="p-6 hidden md:block">
          <Link href="/" className="font-bold text-xl flex items-center gap-3 transition-all link-hover-effect group">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl bg-[var(--color-primary)] shadow-lg flex items-center justify-center text-white font-bold group-hover:shadow-[var(--color-primary)]/40"
            >
              AI
            </motion.div>
            <span className="bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent dark:from-white dark:to-gray-300">Support</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 btn-hover-effect
                  ${isActive 
                    ? 'bg-[var(--color-primary)] text-white shadow-lg' 
                    : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5'}
                `}
                onClick={() => setIsMobileOpen(false)}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[var(--color-primary)] rounded-xl -z-10 shadow-lg shadow-[var(--color-primary)]/20"
                  />
                )}
                <Icon size={18} className={isActive ? 'text-white' : 'text-foreground/50 group-hover:text-foreground transition-colors'} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-3 py-2 rounded-2xl bg-foreground/5 border border-transparent hover:border-foreground/10 transition-all card-hover-effect">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-pastel-green)] to-[var(--color-primary)] shadow-sm border-2 border-white dark:border-card"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{userEmail}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-foreground/40 font-medium">Session Active</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => signout()}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all btn-hover-effect"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
