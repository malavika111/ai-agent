import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized login required to delete' }, { status: 401 })

    const { chatId } = await request.json().catch(() => ({}))
    if (!chatId) return NextResponse.json({ error: 'chatId required in payload' }, { status: 400 })

    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', user.id)

    if (deleteError) {
        console.error("Supabase Chat Deletion error:", deleteError)
        throw deleteError
    }

    return NextResponse.json({ success: true, message: 'Chat permanently deleted' }, { status: 200 })
  } catch (error: any) {
    console.error('Delete Chat Internal Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown internal server error' }, { status: 500 })
  }
}
