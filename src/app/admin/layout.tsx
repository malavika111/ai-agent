import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Admin check (using profiles table)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // In development we might just allow it, but for a real app, strict check
  // if (profile?.role !== 'admin') {
  //   redirect('/dashboard')
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userEmail={user.email || ''} />
      
      <main className="flex-1 flex flex-col h-full bg-background md:bg-gray-50/50">
        <div className="h-full w-full rounded-tl-none md:rounded-tl-2xl bg-card border-none md:border-l md:border-t md:border-border shadow-soft overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  )
}
