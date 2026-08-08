import { getSettingValue } from '@/lib/settings'

export type NotifyResult = { ok: true } | { ok: false; reason: string }

/**
 * Emails the founder when something needs attention (new order, payment claim).
 * Uses Resend when RESEND_API_KEY is set; otherwise a no-op — the admin Orders
 * page always shows the same information. Never throws: returns a result the
 * Settings test button can surface, while order routes can ignore it.
 */
export async function notifyFounder(subject: string, text: string): Promise<NotifyResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    // Email addresses are case-insensitive; lowercase so a stray capital can't
    // fail Resend's "own address only" sandbox check.
    const to = (await getSettingValue('notification_email')).trim().toLowerCase()
    if (!apiKey) {
      console.error('notifyFounder: RESEND_API_KEY is not set')
      return { ok: false, reason: 'RESEND_API_KEY is not set on the server (add it in Vercel and redeploy).' }
    }
    if (!to) {
      console.error('notifyFounder: notification_email setting is empty')
      return { ok: false, reason: 'No notification email is saved in Settings.' }
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'YBBeautylounge <onboarding@resend.dev>',
        to: [to],
        subject,
        text,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('notifyFounder: Resend rejected the email', res.status, body)
      return { ok: false, reason: `Resend rejected the email (${res.status}): ${body}` }
    }
    return { ok: true }
  } catch (e) {
    // notification failure must never break an order — but leave a trace in the logs
    console.error('notifyFounder failed', e)
    return { ok: false, reason: e instanceof Error ? e.message : 'Sending failed.' }
  }
}
