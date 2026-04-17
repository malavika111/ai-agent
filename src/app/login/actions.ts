'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const identifier = formData.get('email') as string // This was the identifier input
  const password = formData.get('password') as string
  let loginEmail = identifier

  // If identifier is not an email (no @), look it up in the profiles table
  if (!identifier.includes('@')) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', identifier)
      .single()

    if (profileError || !profile) {
      redirect(`/login?error=${encodeURIComponent("User does not exist. Please sign up.")}`)
    }
    loginEmail = profile.email
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  })

  if (error) {
    let errorMessage = "Could not authenticate user";
    if (error.message === "Invalid login credentials") {
      errorMessage = "Incorrect password"
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Please verify your email before logging in."
    } else {
      errorMessage = error.message
    }
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Check if username is already taken
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (existingUser) {
    redirect(`/login?error=${encodeURIComponent("Username already taken")}`)
  }

  // 2. Create the Auth user
  const { data: { user }, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        username,
        full_name: username // Fallback for profile page
      }
    }
  })

  if (signupError) {
    redirect(`/login?error=${encodeURIComponent(signupError.message)}`)
  }

  // 3. Insert into profiles table if user was created
  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username,
        email
      })

    if (profileError) {
        // Log this? Usually user is created, but profile fails. 
        // In a real app we might want to clean up auth user, but for now we proceed.
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (data?.url) {
    redirect(data.url)
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function sendPasswordResetEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/forgot-password?message=${encodeURIComponent('Check your email for the password reset link')}`)
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect(`/update-password?error=${encodeURIComponent(error.message)}`)
  }

  // Log user out so they can log back in with their new password cleanly, or redirect to login.
  // We'll redirect to login directly and sign out out of abundance of caution.
  await supabase.auth.signOut()
  redirect('/login?message=' + encodeURIComponent('Password successfully updated'))
}

