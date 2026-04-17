import { createClient } from '@/utils/supabase/server'
import { Users, FileText, MessageSquare, Activity } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Simplified analytics fetching
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true })
  const { count: chatsCount } = await supabase.from('chat_sessions').select('*', { count: 'exact', head: true })

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto overflow-y-auto h-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-2 text-foreground/70">Overview of platform usage and user activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-4">
          <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-foreground/70">Total Users</p>
            <p className="text-2xl font-bold">{usersCount || 0}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-4">
          <div className="p-3 bg-[var(--color-pastel-green)]/20 text-[var(--color-pastel-green-dark)] rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-foreground/70">Knowledge Docs</p>
            <p className="text-2xl font-bold">{docsCount || 0}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-4">
          <div className="p-3 bg-[var(--color-pastel-red)]/20 text-[var(--color-pastel-red-dark)] rounded-xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm text-foreground/70">Total Chats</p>
            <p className="text-2xl font-bold">{chatsCount || 0}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-4">
          <div className="p-3 bg-[var(--color-pastel-yellow)]/20 text-[var(--color-pastel-yellow-dark)] rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-foreground/70">Active Rate</p>
            <p className="text-2xl font-bold">~</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="text-[var(--color-primary)]" size={20} />
            Recent Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-black/5 dark:bg-white/5">
                <th className="p-4 text-sm font-medium text-foreground/70">Email</th>
                <th className="p-4 text-sm font-medium text-foreground/70">Name</th>
                <th className="p-4 text-sm font-medium text-foreground/70">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.full_name || '-'}</td>
                    <td className="p-4">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-foreground/50">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
