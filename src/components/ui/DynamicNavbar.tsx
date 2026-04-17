'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { UserProfileDropdown } from '@/components/auth/UserProfileDropdown'
import { motion } from 'framer-motion'

export function DynamicNavbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // First check if there is an active session in local storage/cookie
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) return <div className="w-10 h-10 md:w-32 h-10" />

  return (
    <nav className="flex items-center gap-8 md:gap-10">
      {user ? (
        <UserProfileDropdown userEmail={user.email} />
      ) : (
        null
      )}
    </nav>
  )
}
