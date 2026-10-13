export type RentcastListing = {
  id: string
  formattedAddress?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  county?: string
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  status?: 'Active' | 'Inactive'
  price?: number
  listedDate?: string
  lastSeenDate?: string
  mlsName?: string
  mlsNumber?: string
  listingOffice?: { name?: string }
}

export type DmvMarket = { city: string; state: 'DC' | 'MD' | 'VA'; label: string }

export const DMV_MARKETS: DmvMarket[] = [
  { city: 'Washington', state: 'DC', label: 'Washington, DC' },
  { city: 'Bethesda', state: 'MD', label: 'Montgomery County, MD' },
  { city: 'Silver Spring', state: 'MD', label: 'Montgomery County, MD' },
  { city: 'Rockville', state: 'MD', label: 'Montgomery County, MD' },
  { city: 'Hyattsville', state: 'MD', label: "Prince George's County, MD" },
  { city: 'Bowie', state: 'MD', label: "Prince George's County, MD" },
  { city: 'Arlington', state: 'VA', label: 'Arlington, VA' },
  { city: 'Alexandria', state: 'VA', label: 'Alexandria, VA' },
  { city: 'Fairfax', state: 'VA', label: 'Fairfax County, VA' },
]

export type ListingRow = {
  slug: string
  title: string
  neighborhood: string
  city: string
  dealType: 'buy' | 'rent'
  price: number
  beds: number | null
  baths: string | null
  sqft: number | null
  summary: string
  status: 'active' | 'off_market'
  listedAt: Date
  source: 'rentcast'
  sourceId: string
  sourceName: string
  address: string
  state: string | null
  zipCode: string | null
  county: string | null
  propertyType: string | null
  mlsName: string | null
  mlsNumber: string | null
  listingOffice: string | null
  lastVerifiedAt: Date
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90)
}

// Stable short suffix so two listings at similar addresses never share a URL.
function shortHash(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619)
  return (h >>> 0).toString(36).slice(0, 6)
}

function positiveInt(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : null
}

// Only facts the feed supplied are used. Listings without an address, price or city are skipped.
export function mapRentcastListing(
  raw: RentcastListing,
  dealType: 'buy' | 'rent',
  market: DmvMarket,
  verifiedAt: Date,
): ListingRow | null {
  const price = positiveInt(raw.price)
  const address = raw.formattedAddress?.trim()
  const street = [raw.addressLine1, raw.addressLine2].filter(Boolean).join(', ').trim()
  if (!raw.id || !price || !address || !street || !raw.city) return null

  const beds = typeof raw.bedrooms === 'number' && raw.bedrooms >= 0 ? Math.round(raw.bedrooms) : null
  const baths = typeof raw.bathrooms === 'number' && raw.bathrooms > 0 ? raw.bathrooms.toFixed(1) : null
  const sqft = positiveInt(raw.squareFootage)
  const kind = raw.propertyType ?? 'Home'
  const bedText = beds === null ? '' : beds === 0 ? 'Studio ' : `${beds}-bedroom `
  const summary = `${bedText}${kind.toLowerCase()} ${dealType === 'rent' ? 'for rent' : 'for sale'} in ${raw.city}, ${raw.state ?? market.state}.`

  return {
    slug: `${slugify(`${street}-${raw.city}-${raw.state ?? ''}`)}-${dealType}-${shortHash(`${dealType}:${raw.id}`)}`,
    title: street,
    neighborhood: raw.county ? `${raw.county} County` : market.label,
    city: raw.city,
    dealType,
    price,
    beds,
    baths,
    sqft,
    summary: summary.charAt(0).toUpperCase() + summary.slice(1),
    status: raw.status === 'Inactive' ? 'off_market' : 'active',
    listedAt: raw.listedDate ? new Date(raw.listedDate) : verifiedAt,
    source: 'rentcast',
    sourceId: `${dealType}:${raw.id}`,
    sourceName: 'RentCast',
    address,
    state: raw.state ?? null,
    zipCode: raw.zipCode ?? null,
    county: raw.county ?? null,
    propertyType: raw.propertyType ?? null,
    mlsName: raw.mlsName ?? null,
    mlsNumber: raw.mlsNumber ?? null,
    listingOffice: raw.listingOffice?.name?.trim() || null,
    lastVerifiedAt: verifiedAt,
  }
}
