import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background/50">
      <Sidebar userEmail={session.user.email || ''} />
      
      <main className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
        <div className="h-full w-full rounded-none md:rounded-tl-[4rem] bg-card/40 backdrop-blur-3xl border-l border-t border-foreground/5 shadow-2xl relative transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none"></div>
          <div className="h-full relative z-10 overflow-y-auto no-scrollbar scroll-smooth">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
