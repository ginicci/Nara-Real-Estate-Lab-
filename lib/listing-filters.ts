export type DealType = 'buy' | 'rent'

export type ListingFilters = {
  location?: string
  type?: DealType
  maxPrice?: number
}

type RawParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function parseListingFilters(params: RawParams): ListingFilters {
  const filters: ListingFilters = {}

  const location = first(params.location)?.trim().slice(0, 80)
  if (location) filters.location = location

  const type = first(params.type)
  if (type === 'buy' || type === 'rent') filters.type = type

  const maxPrice = Number(first(params.maxPrice))
  if (Number.isInteger(maxPrice) && maxPrice > 0 && maxPrice <= 100_000_000) filters.maxPrice = maxPrice

  return filters
}

export function listingsHref(filters: ListingFilters) {
  const params = new URLSearchParams()
  if (filters.location) params.set('location', filters.location)
  if (filters.type) params.set('type', filters.type)
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
  const query = params.toString()
  return query ? `/homes?${query}` : '/homes'
}

export function formatPrice(price: number, type: DealType) {
  const amount = `$${price.toLocaleString('en-US')}`
  return type === 'rent' ? `${amount}/mo` : amount
}

export function formatBaths(baths: string | number) {
  const n = Number(baths)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

type FactSource = { beds: number | null; baths: string | number | null; sqft: number | null }

// Only facts the source actually provided; missing values are left out rather than guessed.
export function listingFacts({ beds, baths, sqft }: FactSource) {
  const facts: { label: string; short: string; value: string }[] = []
  if (beds !== null) facts.push({ label: 'Bedrooms', short: beds === 0 ? 'Studio' : `${beds} bd`, value: beds === 0 ? 'Studio' : String(beds) })
  if (baths !== null && Number(baths) > 0) facts.push({ label: 'Bathrooms', short: `${formatBaths(baths)} ba`, value: formatBaths(baths) })
  if (sqft !== null) facts.push({ label: 'Square feet', short: `${sqft.toLocaleString('en-US')} sq ft`, value: sqft.toLocaleString('en-US') })
  return facts
}

export function formatVerified(date: Date | string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
}
