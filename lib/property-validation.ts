import { z } from 'zod'
const optionalNumber = (max: number) => z.preprocess(v => v === '' ? null : v, z.coerce.number().min(0).max(max).nullable())
export const propertySchema = z.object({
  title: z.string().trim().min(3).max(160),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().length(2).transform(s => s.toUpperCase()),
  zipCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/),
  neighborhood: z.string().trim().max(100),
  propertyType: z.string().trim().max(100),
  dealType: z.enum(['buy', 'rent']),
  price: z.coerce.number().int().min(1).max(2147483647),
  beds: optionalNumber(100).refine(v => v === null || Number.isInteger(v)),
  baths: optionalNumber(99),
  sqft: optionalNumber(10000000).refine(v => v === null || Number.isInteger(v)),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().max(10000),
  status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive']),
  sortOrder: z.coerce.number().int().min(-100000).max(100000),
  expiresAt: z.string().refine(v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)))),
})
export function propertyIdentity(address: string, city: string, state: string, zip: string, deal: string) {
  return [address, city, state, zip, deal].map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '')).join('|')
}
export function photoMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png'
  if (Buffer.from(bytes.subarray(0,4)).toString() === 'RIFF' && Buffer.from(bytes.subarray(8,12)).toString() === 'WEBP') return 'image/webp'
  return null
}
