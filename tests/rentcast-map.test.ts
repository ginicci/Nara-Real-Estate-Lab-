import { describe, expect, it } from 'vitest'
import { DMV_MARKETS, mapRentcastListing, type RentcastListing } from '@/lib/listing-sources/rentcast-map'
import { listingFacts } from '@/lib/listing-filters'

const market = DMV_MARKETS.find((m) => m.city === 'Arlington')!
const now = new Date('2026-10-13T12:00:00Z')

const base: RentcastListing = {
  id: '1200-N-Garfield-St,-Arlington,-VA-22201',
  formattedAddress: '1200 N Garfield St, Arlington, VA 22201',
  addressLine1: '1200 N Garfield St',
  city: 'Arlington',
  state: 'VA',
  zipCode: '22201',
  county: 'Arlington',
  propertyType: 'Condo',
  bedrooms: 2,
  bathrooms: 2,
  squareFootage: 1100,
  status: 'Active',
  price: 725000,
  listedDate: '2026-10-01T00:00:00.000Z',
  mlsName: 'BrightMLS',
  mlsNumber: 'VAAR2000001',
  listingOffice: { name: 'Example Realty' },
}

describe('mapRentcastListing', () => {
  it('maps a complete sale listing with attribution', () => {
    const row = mapRentcastListing(base, 'buy', market, now)!
    expect(row.title).toBe('1200 N Garfield St')
    expect(row.price).toBe(725000)
    expect(row.status).toBe('active')
    expect(row.sourceId).toBe(`buy:${base.id}`)
    expect(row.listingOffice).toBe('Example Realty')
    expect(row.lastVerifiedAt).toBe(now)
    expect(row.slug).toMatch(/^1200-n-garfield-st-arlington-va-buy-[a-z0-9]+$/)
  })

  it('skips listings missing a price, address or city', () => {
    expect(mapRentcastListing({ ...base, price: undefined }, 'buy', market, now)).toBeNull()
    expect(mapRentcastListing({ ...base, price: 0 }, 'buy', market, now)).toBeNull()
    expect(mapRentcastListing({ ...base, formattedAddress: undefined }, 'buy', market, now)).toBeNull()
    expect(mapRentcastListing({ ...base, city: undefined }, 'buy', market, now)).toBeNull()
  })

  it('leaves missing facts empty instead of guessing', () => {
    const row = mapRentcastListing(
      { ...base, bedrooms: undefined, bathrooms: undefined, squareFootage: undefined },
      'rent',
      market,
      now,
    )!
    expect(row.beds).toBeNull()
    expect(row.baths).toBeNull()
    expect(row.sqft).toBeNull()
    expect(listingFacts(row)).toEqual([])
  })

  it('marks inactive listings off market', () => {
    expect(mapRentcastListing({ ...base, status: 'Inactive' }, 'buy', market, now)!.status).toBe('off_market')
  })

  it('gives sale and rental versions of the same address different ids and slugs', () => {
    const sale = mapRentcastListing(base, 'buy', market, now)!
    const rent = mapRentcastListing(base, 'rent', market, now)!
    expect(sale.sourceId).not.toBe(rent.sourceId)
    expect(sale.slug).not.toBe(rent.slug)
  })
})
