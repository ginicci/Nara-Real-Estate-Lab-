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
