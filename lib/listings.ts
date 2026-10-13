import 'server-only'
import { and, count, desc, eq, ilike, lte, ne, or, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { listings } from '@/lib/db/schema'
import type { ListingFilters } from '@/lib/listing-filters'

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}

const isPublic = ne(listings.source, 'sample')

function whereFor(filters: ListingFilters) {
  const conditions: SQL[] = [isPublic, eq(listings.status, 'active')]
  if (filters.location) {
    const pattern = `%${escapeLike(filters.location)}%`
    conditions.push(
      or(
        ilike(listings.neighborhood, pattern),
        ilike(listings.city, pattern),
        ilike(listings.county, pattern),
        ilike(listings.zipCode, pattern),
        ilike(listings.state, pattern),
      )!,
    )
  }
  if (filters.type) conditions.push(eq(listings.dealType, filters.type))
  if (filters.maxPrice) conditions.push(lte(listings.price, filters.maxPrice))
  return and(...conditions)
}

export async function findListings(filters: ListingFilters, limit = 48) {
  return db.select().from(listings).where(whereFor(filters)).orderBy(desc(listings.listedAt)).limit(limit)
}

export async function countListings(filters: ListingFilters) {
  const [row] = await db.select({ value: count() }).from(listings).where(whereFor(filters))
  return row?.value ?? 0
}

export async function getListingBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.slug, slug), isPublic))
    .limit(1)
  return row ?? null
}
