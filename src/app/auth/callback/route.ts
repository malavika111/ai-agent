import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (user) {
      // Auto-create profile if Google user doesn't have one
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Generate a simple username from email if not present
        const baseUsername = user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`
        
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: baseUsername,
            email: user.email
          })
      }
    }
  } else if (!code && next === '/update-password') {
    // If somehow we get here without a code, redirect to login
    return redirect(`${origin}/login?error=${encodeURIComponent('No authentication code provided.')}`)
  }

  // URL to redirect to after sign in process completes
  return redirect(`${origin}${next}`)
}
