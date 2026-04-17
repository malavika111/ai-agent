import Link from 'next/link'
import { Zap, Orbit, Infinity, Activity, Cpu, Sparkles } from 'lucide-react'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'
import { DynamicNavbar } from '@/components/ui/DynamicNavbar'
import { DynamicCTA } from '@/components/ui/DynamicCTA'
import * as motion from 'framer-motion/client'

export default function LandingPage() {
  return (
    <PageEntrance>
      <div className="min-h-screen flex flex-col selection:bg-foreground selection:text-background overflow-hidden relative font-sans">
        {/* Dynamic Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.03] pointer-events-none scale-150">
          <Orbit size={800} strokeWidth={0.5} className="animate-[spin_60s_linear_infinite]" />
        </div>
        <div className="absolute top-1/4 right-1/4 -z-10 opacity-[0.02] pointer-events-none rotate-45">
          <Infinity size={400} strokeWidth={1} />
        </div>

        {/* Premium Enhanced Navbar */}
        <header className="px-8 py-5 flex items-center justify-between z-50 sticky top-0 glass-nav transition-all duration-300">
          <Link href="/" className="group flex items-center gap-4 transition-transform duration-300 hover:scale-[1.03]">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1, borderRadius: "50%" }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-10 h-10 rounded-[1rem] bg-[var(--color-primary)] text-white flex items-center justify-center font-black text-xs shadow-xl ring-2 ring-white/20 font-heading"
            >
              AI
            </motion.div>
            <span className="font-heading font-black text-xl tracking-[-0.07em] uppercase text-foreground">Support</span>
          </Link>
          
          <DynamicNavbar />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center text-center px-8 relative py-20 md:py-32">
          <div className="z-10 max-w-5xl relative space-y-12">
            
            {/* Animated Badge Pill */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="inline-flex items-center gap-4 px-8 py-3 rounded-full border border-foreground/[0.08] bg-white/50 shadow-2xl backdrop-blur-3xl text-[9px] font-black uppercase tracking-[0.5em] mb-4 text-foreground/60 border-l-4 border-l-[var(--color-primary)] mx-auto relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Activity size={14} className="text-pink-400 animate-pulse" />
              <span>Fluid Neural Engine v2.0.4</span>
              <Sparkles size={12} className="text-[var(--color-primary)]" />
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-[8rem] md:text-[10.5rem] font-[800] tracking-widest text-foreground uppercase drop-shadow-2xl font-bubbly melova-shine relative">
                MELOVA
              </h1>
              
              <div className="gradient-fade-line max-w-lg mx-auto" />
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-xl md:text-2xl font-[400] tracking-[0.2em] text-foreground/40 font-bubbly lg:px-20 leading-relaxed uppercase"
              >
                i am here to answer you
              </motion.p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 md:gap-14 pt-14">
              <DynamicCTA />
            </div>
          </div>
          
          {/* Subtle Background Circular Patterns */}
          <div className="absolute bottom-10 left-10 opacity-[0.03] scale-150 rotate-12 -z-20 pointer-events-none">
             <div className="w-[300px] h-[300px] border-[20px] border-foreground rounded-full animate-[pulse_10s_infinite]" />
          </div>
        </main>

        <footer className="px-12 py-12 md:py-16 border-t border-foreground/[0.04] flex flex-col md:flex-row items-center justify-between gap-12 glass-nav z-10 translate-y-px">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground/20">Security Layer</span>
              <div className="flex items-center gap-3">
                 <Zap size={14} className="text-foreground/40" />
                 <span className="text-xs font-black uppercase text-foreground">Zero-Signal Arch</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground/20">Processing</span>
              <div className="flex items-center gap-3">
                <Cpu size={14} className="text-foreground/40" strokeWidth={3} />
                <span className="text-xs font-black uppercase text-foreground">Fluid Core v2.0.4</span>
              </div>
            </div>
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.6em] text-foreground/10 text-center md:text-right md:border-r border-foreground/5 md:pr-10">
            PROPRIETARY ACCESS NODE &copy; 2026 INTERNAL SYSTEMS <br />
            AUTHORIZED PERSONNEL ONLY
          </div>
        </footer>
      </div>
    </PageEntrance>
  )
}
