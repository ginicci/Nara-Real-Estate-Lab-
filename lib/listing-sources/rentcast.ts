import 'server-only'
import { and, eq, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { listings } from '@/lib/db/schema'
import { DMV_MARKETS, mapRentcastListing, type ListingRow, type RentcastListing } from './rentcast-map'

const ENDPOINTS = {
  buy: 'https://api.rentcast.io/v1/listings/sale',
  rent: 'https://api.rentcast.io/v1/listings/rental/long-term',
} as const

const PER_MARKET = 12

async function fetchMarket(apiKey: string, dealType: 'buy' | 'rent', city: string, state: string) {
  const url = new URL(ENDPOINTS[dealType])
  url.searchParams.set('city', city)
  url.searchParams.set('state', state)
  url.searchParams.set('status', 'Active')
  url.searchParams.set('limit', String(PER_MARKET))
  const res = await fetch(url, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' }, cache: 'no-store' })
  if (!res.ok) throw new Error(`RentCast ${dealType} ${city}, ${state}: HTTP ${res.status}`)
  return (await res.json()) as RentcastListing[]
}

export type SyncResult = { upserted: number; markedOffMarket: number; errors: string[] }

export async function syncRentcastListings(): Promise<SyncResult> {
  const apiKey = process.env.RENTCAST_API_KEY
  if (!apiKey) throw new Error('RENTCAST_API_KEY is not set')

  const verifiedAt = new Date()
  const rows: ListingRow[] = []
  const errors: string[] = []

  for (const market of DMV_MARKETS) {
    for (const dealType of ['buy', 'rent'] as const) {
      try {
        const raw = await fetchMarket(apiKey, dealType, market.city, market.state)
        for (const item of raw) {
          const row = mapRentcastListing(item, dealType, market, verifiedAt)
          if (row) rows.push(row)
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error))
      }
    }
  }

  const unique = [...new Map(rows.map((r) => [r.sourceId, r])).values()]

  for (const row of unique) {
    await db
      .insert(listings)
      .values(row)
      .onConflictDoUpdate({
        target: [listings.source, listings.sourceId],
        set: {
          price: row.price,
          beds: row.beds,
          baths: row.baths,
          sqft: row.sqft,
          summary: row.summary,
          status: row.status,
          listingOffice: row.listingOffice,
          mlsName: row.mlsName,
          mlsNumber: row.mlsNumber,
          lastVerifiedAt: row.lastVerifiedAt,
        },
      })
  }

  // A listing the feed no longer returns as active is hidden, never deleted. Skipped
  // when any market failed so an outage doesn't take every listing offline.
  let markedOffMarket = 0
  if (errors.length === 0) {
    const stale = await db
      .update(listings)
      .set({ status: 'off_market' })
      .where(
        and(eq(listings.source, 'rentcast'), eq(listings.status, 'active'), lt(listings.lastVerifiedAt, verifiedAt)),
      )
      .returning({ id: listings.id })
    markedOffMarket = stale.length
  }

  return { upserted: unique.length, markedOffMarket, errors }
}
