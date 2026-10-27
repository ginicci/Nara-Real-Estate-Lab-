'use server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { and, eq, ne, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { canReviewLeads } from '@/lib/lead-access'
import { db } from '@/lib/db'
import { listings } from '@/lib/db/schema'
import { photoMime, propertyIdentity, propertySchema } from '@/lib/property-validation'

export async function saveProperty(_: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user.emailVerified || !canReviewLeads(session.user.id)) return { error: 'Authorized, verified admin access is required.' }
  const parsed = propertySchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) return { error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }
  const id = Number(form.get('id'))
  if (!Number.isInteger(id) || id < 0) return { error: 'Invalid property.' }
  const input = parsed.data
  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length > 8 || files.reduce((n,f) => n + f.size,0) > 2 * 1024 * 1024) return { error: 'Upload at most 8 photos, totaling 2 MB. Resize photos on your phone first.' }
  const uploaded: string[] = []
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const mime = photoMime(bytes)
    if (!mime) return { error: 'Photos must be JPEG, PNG or WebP images.' }
    uploaded.push(`data:${mime};base64,${Buffer.from(bytes).toString('base64')}`)
  }
  try {
    await db.transaction(async tx => {
      // Serialize duplicate checks, including simultaneous requests from different admins.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(746271)`)
      const [existing] = id ? await tx.select().from(listings).where(eq(listings.id,id)) : []
      if (id && (!existing || existing.source === 'sample')) throw new Error('Property not found.')
      if (existing && existing.updatedAt.toISOString() !== form.get('version')) throw new Error('Another admin changed this property. Reload before editing.')
      const identity = propertyIdentity(input.address,input.city,input.state,input.zipCode,input.dealType)
      const candidates = await tx.select({ id: listings.id, address: listings.address, city: listings.city, state: listings.state, zip: listings.zipCode, deal: listings.dealType }).from(listings).where(and(ne(listings.id,id),ne(listings.source,'sample')))
      const duplicate = candidates.find(r => r.address && propertyIdentity(r.address,r.city,r.state ?? '',r.zip ?? '',r.deal) === identity)
      if (duplicate) throw new Error(`This address is already listed (property #${duplicate.id}). Edit the existing property instead; include a unit number for separate units.`)
      const photos = uploaded.length ? uploaded : form.get('clearPhotos') === 'on' ? [] : existing?.photos ?? []
      const values = { ...input, baths: input.baths === null ? null : String(input.baths), expiresAt: input.expiresAt ? new Date(`${input.expiresAt}T23:59:59Z`) : null, featured: form.get('featured') === 'on', photos, image: photos[0] ?? (form.get('clearPhotos') === 'on' ? null : existing?.image ?? null), updatedAt: new Date(), managed: true, source: existing?.source ?? 'manual', sourceId: existing && existing.source !== 'manual' ? existing.sourceId : identity, sourceName: existing?.sourceName ?? 'Nara Real Estate', lastVerifiedAt: new Date() }
      if (id) await tx.update(listings).set(values).where(eq(listings.id,id))
      else await tx.insert(listings).values({ ...values, slug: `nara-${crypto.randomUUID()}` })
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return { error: /Another admin|already listed|Property not found/.test(message) ? message : 'Could not save. Please try again. If this persists, check database configuration.' }
  }
  revalidatePath('/homes', 'layout')
  revalidatePath('/dashboard/properties')
  return { success: 'Property saved. Active, unexpired properties are now visible on the website.' }
}
