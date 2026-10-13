import { timingSafeEqual } from 'node:crypto'
import { syncRentcastListings } from '@/lib/listing-sources/rentcast'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('authorization') ?? ''
  if (!secret) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const given = Buffer.from(header)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

// Vercel Cron calls this daily with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: Request) {
  if (!authorized(request)) return new Response('Unauthorized', { status: 401 })
  if (!process.env.RENTCAST_API_KEY) {
    return Response.json({ ok: false, error: 'RENTCAST_API_KEY is not configured' }, { status: 503 })
  }
  const result = await syncRentcastListings()
  if (result.errors.length) console.error('Listing sync errors:', result.errors)
  return Response.json({ ok: result.errors.length === 0, ...result })
}
