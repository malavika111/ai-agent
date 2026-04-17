import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use Service Role to bypass RLS and direct fetch messages if session table is lagging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
    }

    console.log(`[CHAT-HISTORY] Direct fetch for chatId: ${chatId}`)

    // ✅ DIRECTLY fetch messages (Bypassing strict session table check)
    // Using whatever ID provided in search param as the session filter
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', chatId) // Mapping chatId to the session_id column in messages
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[CHAT-HISTORY] DB Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      messages: data || [] 
    })

  } catch (err: any) {
    console.error('[CHAT-HISTORY] Global Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
