import 'server-only'
import { and, asc, count, desc, getTableColumns, gt, isNull, sql, eq, ilike, lte, ne, or, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { listings, type Listing } from '@/lib/db/schema'
import type { ListingFilters } from '@/lib/listing-filters'

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}

const isPublic = and(ne(listings.source, 'sample'), eq(listings.status, 'active'), or(isNull(listings.expiresAt), gt(listings.expiresAt, sql`now()`)))!

function whereFor(filters: ListingFilters) {
  const conditions: SQL[] = [isPublic]
  if (filters.location) {
    const pattern = `%${escapeLike(filters.location)}%`
    conditions.push(
      or(
        ilike(listings.title, pattern),
        ilike(listings.address, pattern),
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

// Avoid transferring uploaded photo bytes in every listing query / page response.
const { photos: _photos, image: _image, ...columns } = getTableColumns(listings)
const publicColumns = {
  ...columns,
  image: sql<string | null>`CASE WHEN jsonb_array_length(${listings.photos}) > 0 THEN NULL ELSE ${listings.image} END`,
  photoCount: sql<number>`jsonb_array_length(${listings.photos})`,
}
function publicPhotos(row: Omit<Listing, 'photos'> & { photoCount: number }): Listing {
  const { photoCount, ...rest } = row
  const photos = Array.from({ length: photoCount }, (_, i) => `/api/property-photos/${row.id}/${i}`)
  return { ...rest, image: photos[0] ?? row.image, photos }
}

export async function findListings(filters: ListingFilters, limit = 48, offset = 0) {
  const rows = await db.select(publicColumns).from(listings).where(whereFor(filters)).orderBy(desc(listings.featured), asc(listings.sortOrder), desc(listings.listedAt)).limit(limit).offset(offset)
  return rows.map(publicPhotos)
}

export async function countListings(filters: ListingFilters) {
  const [row] = await db.select({ value: count() }).from(listings).where(whereFor(filters))
  return row?.value ?? 0
}

export async function getListingBySlug(slug: string) {
  const [row] = await db
    .select(publicColumns)
    .from(listings)
    .where(and(eq(listings.slug, slug), isPublic))
    .limit(1)
  return row ? publicPhotos(row) : null
}
