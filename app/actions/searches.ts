'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { savedSearches } from '@/lib/db/schema'
import { sendEmail } from '@/lib/email/send'
import { savedSearchCreated } from '@/lib/email/templates'
import type { FormState } from './public'

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

export async function getSavedSearches() {
  const user = await getSessionUser()
  return db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, user.id))
    .orderBy(desc(savedSearches.createdAt))
}

const searchSchema = z.object({
  location: z.string().trim().min(2, 'Enter a city or neighborhood').max(80),
  maxPrice: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d]/g, ''))
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isSafeInteger(v) && v > 0 && v <= 100_000_000), 'Enter a valid price'),
})

export async function createSavedSearch(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser()
  const parsed = searchSchema.safeParse({
    location: formData.get('location') ?? '',
    maxPrice: formData.get('maxPrice') ?? '',
  })
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check your details.' }
  }

  const [row] = await db
    .insert(savedSearches)
    .values({ userId: user.id, ...parsed.data })
    .returning({ id: savedSearches.id })

  const sent = await sendEmail({
    to: user.email,
    idempotencyKey: `saved-search/${row.id}`,
    ...savedSearchCreated(parsed.data),
  })

  revalidatePath('/dashboard')
  return {
    status: 'success',
    message: sent.ok ? 'Alert saved. Confirmation sent to your inbox.' : 'Alert saved.',
  }
}

export async function toggleSavedSearch(id: number, notify: boolean) {
  const user = await getSessionUser()
  await db
    .update(savedSearches)
    .set({ notify })
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, user.id)))
  revalidatePath('/dashboard')
}

export async function deleteSavedSearch(id: number) {
  const user = await getSessionUser()
  await db
    .delete(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, user.id)))
  revalidatePath('/dashboard')
}
