import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClientPage from './SettingsClientPage'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Pass only the necessary serializable data to the Client Component
  const userData = {
    id: user.id,
    email: user.email || ''
  }

  return <SettingsClientPage user={userData} />
}
