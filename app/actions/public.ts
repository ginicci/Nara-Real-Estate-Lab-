'use server'

import { and, count, eq, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactMessages, waitlist } from '@/lib/db/schema'
import { inboxAddress, sendEmail } from '@/lib/email/send'
import {
  contactAdminAlert,
  contactReceipt,
  waitlistAdminAlert,
  waitlistWelcome,
} from '@/lib/email/templates'
import { CONTACT_LIMIT_PER_HOUR, contactSchema, waitlistSchema } from '@/lib/validation'

export type FormState = { status: 'idle' | 'success' | 'error'; message: string }

export async function joinWaitlist(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get('company')) return { status: 'success', message: "You're on the list." }

  const parsed = waitlistSchema.safeParse({
    email: formData.get('email') ?? '',
    name: formData.get('name') ?? '',
    interest: formData.get('interest') ?? '',
  })
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check your details.' }
  }
  const entry = parsed.data

  const existing = await db
    .select({ id: waitlist.id })
    .from(waitlist)
    .where(eq(waitlist.email, entry.email))
    .limit(1)
  if (existing.length) return { status: 'success', message: "You're already on the list." }

  const [row] = await db.insert(waitlist).values(entry).returning({ id: waitlist.id })

  await sendEmail({
    to: entry.email,
    idempotencyKey: `waitlist-welcome/${row.id}`,
    ...waitlistWelcome(entry.name),
  })
  const inbox = inboxAddress()
  if (inbox) {
    await sendEmail({
      to: inbox,
      replyTo: entry.email,
      idempotencyKey: `waitlist-alert/${row.id}`,
      ...waitlistAdminAlert(entry),
    })
  }

  return { status: 'success', message: "You're on the list. Check your inbox." }
}

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get('company')) return { status: 'success', message: 'Thanks, we got it.' }

  const parsed = contactSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    topic: formData.get('topic') ?? '',
    message: formData.get('message') ?? '',
  })
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check your details.' }
  }
  const msg = parsed.data

  const [recent] = await db
    .select({ n: count() })
    .from(contactMessages)
    .where(
      and(
        eq(contactMessages.email, msg.email),
        gt(contactMessages.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
      ),
    )
  if ((recent?.n ?? 0) >= CONTACT_LIMIT_PER_HOUR) {
    return { status: 'error', message: 'You have sent several messages recently. Please try again later.' }
  }

  const [row] = await db.insert(contactMessages).values(msg).returning({ id: contactMessages.id })

  const inbox = inboxAddress()
  if (inbox) {
    await sendEmail({
      to: inbox,
      replyTo: msg.email,
      idempotencyKey: `contact-alert/${row.id}`,
      ...contactAdminAlert(msg),
    })
  }
  await sendEmail({
    to: msg.email,
    idempotencyKey: `contact-receipt/${row.id}`,
    ...contactReceipt(msg.name),
  })

  return { status: 'success', message: "Thanks — we'll reply within one business day." }
}
