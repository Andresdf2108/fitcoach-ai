import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function sendMessage(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const body = (formData.get('body') as string)?.trim()
  if (!body) return
  await supabase.from('messages').insert({
    sender_id: user.id,
    recipient_id: formData.get('recipient_id') as string,
    body,
  })
  revalidatePath('/trainer/messages')
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all trainees for this trainer (to message them)
  const { data: trainees } = await supabase
    .from('trainees')
    .select('id, profiles(full_name, email)')
    .eq('trainer_id', user!.id)
    .eq('status', 'active')

  // Get all messages involving the trainer
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(full_name), recipient:profiles!recipient_id(full_name)')
    .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .order('created_at', { ascending: true })

  // Group messages by conversation partner
  const conversations = new Map<string, { profile: any; messages: any[] }>()
  for (const m of messages ?? []) {
    const partnerId = m.sender_id === user!.id ? m.recipient_id : m.sender_id
    const partnerProfile = m.sender_id === user!.id ? m.recipient : m.sender
    if (!conversations.has(partnerId)) {
      conversations.set(partnerId, { profile: partnerProfile, messages: [] })
    }
    conversations.get(partnerId)!.messages.push(m)
  }

  const convList = Array.from(conversations.entries())

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Messages</h1>
        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
          {convList.length} conversation{convList.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* No trainees */}
      {(!trainees || trainees.length === 0) && convList.length === 0 && (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 48, textAlign: 'center',
        }}>
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>💬</p>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            No active clients yet. Activate clients to start messaging.
          </p>
        </div>
      )}

      {/* Start new conversation */}
      {trainees && trainees.length > 0 && (
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 20, marginBottom: 24,
        }}>
          <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>New Message</h2>
          <form action={sendMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <select name="recipient_id" required style={{
              background: '#111', border: '1px solid #333', borderRadius: 8,
              padding: '10px 14px', color: '#fff', fontSize: 14, flexShrink: 0,
            }}>
              <option value="">Select client</option>
              {trainees.map(t => (
                <option key={t.id} value={t.id}>
                  {(t as any).profiles?.full_name ?? 'Client'}
                </option>
              ))}
            </select>
            <input name="body" placeholder="Type your message..." required style={{
              flex: 1, background: '#111', border: '1px solid #333', borderRadius: 8,
              padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none',
            }} />
            <button type="submit" style={{
              background: '#EAB308', color: '#000', fontWeight: 700, border: 'none',
              borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: 'pointer', flexShrink: 0,
            }}>Send</button>
          </form>
        </div>
      )}

      {/* Conversations */}
      {convList.map(([partnerId, conv]) => (
        <div key={partnerId} style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16,
          padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#EAB30820', border: '2px solid #EAB30840',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#EAB308', fontWeight: 800, fontSize: 14,
            }}>
              {(conv.profile?.full_name ?? '?')[0].toUpperCase()}
            </div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>
              {conv.profile?.full_name ?? 'Client'}
            </p>
          </div>

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {conv.messages.map(m => {
              const isMine = m.sender_id === user!.id
              return (
                <div key={m.id} style={{
                  display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '75%',
                    background: isMine ? '#EAB308' : '#222',
                    color: isMine ? '#000' : '#fff',
                    borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '8px 14px', fontSize: 14, lineHeight: 1.5,
                  }}>
                    {m.body}
                    <p style={{
                      fontSize: 10, margin: '4px 0 0', opacity: 0.6,
                      color: isMine ? '#000' : '#6b7280',
                    }}>
                      {new Date(m.created_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Reply form */}
          <form action={sendMessage} style={{ display: 'flex', gap: 8 }}>
            <input type="hidden" name="recipient_id" value={partnerId} />
            <input name="body" placeholder="Reply..." required style={{
              flex: 1, background: '#111', border: '1px solid #333', borderRadius: 8,
              padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none',
            }} />
            <button type="submit" style={{
              background: '#EAB308', color: '#000', fontWeight: 700, border: 'none',
              borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
            }}>↑</button>
          </form>
        </div>
      ))}
    </div>
  )
}
