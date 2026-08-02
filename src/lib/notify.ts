import { getSettingValue } from '@/lib/settings'

/**
 * Emails the founder when something needs attention (new order, payment claim).
 * Uses Resend when RESEND_API_KEY is set; otherwise a silent no-op — the admin
 * Orders page always shows the same information.
 */
export async function notifyFounder(subject: string, text: string): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    const to = await getSettingValue('notification_email')
    if (!apiKey) {
      console.error('notifyFounder: RESEND_API_KEY is not set')
      return
    }
    if (!to) {
      console.error('notifyFounder: notification_email setting is empty')
      return
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
      console.error('notifyFounder: Resend rejected the email', res.status, await res.text())
    }
  } catch (e) {
    // notification failure must never break an order — but leave a trace in the logs
    console.error('notifyFounder failed', e)
  }
}
