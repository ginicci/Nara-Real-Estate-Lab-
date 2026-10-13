'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { contactMessages, waitlist } from '@/lib/db/schema'
import { inboxAddress, sendEmail } from '@/lib/email/send'
import {
  contactAdminAlert,
  contactReceipt,
  waitlistAdminAlert,
  waitlistWelcome,
} from '@/lib/email/templates'

export type FormState = { status: 'idle' | 'success' | 'error'; message: string }

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : null))

const waitlistSchema = z.object({
  email: z.email('Enter a valid email').trim().toLowerCase().max(254),
  name: optionalText(80),
  interest: optionalText(40),
})

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

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  email: z.email('Enter a valid email').trim().toLowerCase().max(254),
  phone: optionalText(30),
  topic: z.enum(['Buying', 'Selling', 'Renting', 'Other']),
  message: z.string().trim().min(10, 'Tell us a bit more (10+ characters)').max(4000),
})

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
