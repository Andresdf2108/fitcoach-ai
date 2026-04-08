import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function sendMessage(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const body = (formData.get('body') as string)?.trim()
  if (!body) return
  const trainerId = formData.get('trainer_id') as string
  await supabase.from('messages').insert({
    sender_id: user.id,
    recipient_id: trainerId,
    body,
  })
  // Mark trainer's messages as read
  await supabase.from('messages')
    .update({ read: true })
    .eq('sender_id', trainerId).eq('recipient_id', user.id)
  revalidatePath('/trainee/messages')
}

export default async function TraineeMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trainee } = await supabase
    .from('trainees')
    .select('trainer_id, profiles!trainer_id(full_name)')
    .eq('id', user!.id)
    .single()

  const trainerId = trainee?.trainer_id
  const trainerName = (trainee as any)?.profiles?.full_name ?? 'Your Coach'

  const { data: messages } = trainerId ? await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user!.id},recipient_id.eq.${trainerId}),and(sender_id.eq.${trainerId},recipient_id.eq.${user!.id})`)
    .order('created_at', { ascending: true }) : { data: [] }

  const unread = (messages ?? []).filter(m => m.sender_id === trainerId && !m.read).length

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 5px', letterSpacing: '-0.03em' }}>Messages</h1>
        <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>
          {trainerId ? `Conversation with ${trainerName}` : 'No trainer assigned yet'}
          {unread > 0 && <span style={{ color: '#FACC15', fontWeight: 600, marginLeft: 8 }}>{unread} new</span>}
        </p>
      </div>

      {!trainerId ? (
        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 28 }}>
          <p style={{ color: '#52525b', fontSize: 14, margin: 0 }}>You don&apos;t have a trainer yet. Once assigned, you&apos;ll be able to message them here.</p>
        </div>
      ) : (
        <>
          {/* Chat thread */}
          <div style={{
            background: '#161616', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: 20, marginBottom: 12,
            minHeight: 300, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {(!messages || messages.length === 0) && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#3f3f46', fontSize: 14 }}>No messages yet. Say hi to your coach!</p>
              </div>
            )}
            {(messages ?? []).map(m => {
              const isMine = m.sender_id === user!.id
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  {!isMine && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: '#FACC15', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, marginRight: 8, alignSelf: 'flex-end',
                    }}>{trainerName[0]?.toUpperCase()}</div>
                  )}
                  <div style={{
                    maxWidth: '72%',
                    background: isMine ? '#FACC15' : '#1f1f1f',
                    color: isMine ? '#000' : '#e4e4e7',
                    borderRadius: isMine ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                    padding: '10px 14px', fontSize: 14, lineHeight: 1.55,
                  }}>
                    {m.body}
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 3, color: isMine ? '#000' : '#6b7280' }}>
                      {new Date(m.created_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Send form */}
          <form action={sendMessage} style={{ display: 'flex', gap: 8 }}>
            <input type="hidden" name="trainer_id" value={trainerId} />
            <input name="body" placeholder={`Message ${trainerName}…`} required style={{
              flex: 1, background: '#161616', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none',
            }} />
            <button type="submit" style={{
              background: '#FACC15', color: '#000', fontWeight: 700, border: 'none',
              borderRadius: 10, padding: '11px 20px', fontSize: 14, cursor: 'pointer',
            }}>Send</button>
          </form>
        </>
      )}
    </div>
  )
}
