import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Until a domain is verified in Resend, the sandbox sender can only deliver
// to the inbox that owns the Resend account. Set EMAIL_FROM (e.g.
// "Nara Real Estate Lab <hello@yourdomain.com>") once the domain is verified.
const FROM = process.env.EMAIL_FROM ?? 'Nara Real Estate Lab <onboarding@resend.dev>'

type SendInput = {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
  idempotencyKey?: string
}

export async function sendEmail({ idempotencyKey, ...input }: SendInput) {
  const { data, error } = await resend.emails.send(
    { from: FROM, ...input },
    idempotencyKey ? { idempotencyKey } : undefined,
  )
  if (error) {
    console.error('[email] send failed:', error.name, error.message)
    return { ok: false as const }
  }
  return { ok: true as const, id: data?.id }
}

export function inboxAddress() {
  return process.env.CONTACT_INBOX_EMAIL
}
