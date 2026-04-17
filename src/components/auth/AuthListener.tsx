'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthListener() {
  useEffect(() => {
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        window.location.href = '/dashboard'
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
