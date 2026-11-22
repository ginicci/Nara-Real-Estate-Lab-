import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, TextInput } from '@/components/field'
import type { ListingFilters } from '@/lib/listing-filters'

const priceOptions = [
  { value: '', label: 'Any price' },
  { value: '3000', label: 'Up to $3,000/mo' },
  { value: '4000', label: 'Up to $4,000/mo' },
  { value: '900000', label: 'Up to $900k' },
  { value: '1500000', label: 'Up to $1.5M' },
  { value: '2500000', label: 'Up to $2.5M' },
]

export function ListingFiltersForm({ filters, action = '/homes' }: { filters: ListingFilters; action?: string }) {
  const hasFilters = Boolean(filters.location || filters.type || filters.maxPrice || filters.minPrice || filters.propertyType)

  return (
    <form action={action} method="get" role="search" className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      <label className="flex flex-col gap-2 md:flex-[2]">
        <span className="text-sm font-medium">Address, neighborhood or city</span>
        <TextInput
          name="location"
          type="search"
          defaultValue={filters.location ?? ''}
          placeholder="Arlington"
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>
      <div className="flex gap-3 md:contents">
        <label className={action === '/deals' ? 'hidden' : 'flex flex-1 flex-col gap-2'}>
          <span className="text-sm font-medium">Looking to</span>
          <Select name="type" defaultValue={filters.type ?? ''}>
            <option value="">Buy or rent</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </Select>
        </label>
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-sm font-medium">Max price</span>
          <Select name="maxPrice" defaultValue={filters.maxPrice ? String(filters.maxPrice) : ''}>
            {priceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            {filters.maxPrice && !priceOptions.some((o) => o.value === String(filters.maxPrice)) && (
              <option value={String(filters.maxPrice)}>Up to ${filters.maxPrice.toLocaleString('en-US')}</option>
            )}
          </Select>
        </label>
      </div>
      <label className="flex flex-col gap-2"><span className="text-sm font-medium">Min price</span><TextInput name="minPrice" type="number" min="1" defaultValue={filters.minPrice} placeholder="Any" className="md:w-28" /></label>
      <label className="flex flex-col gap-2"><span className="text-sm font-medium">Property type</span><TextInput name="propertyType" defaultValue={filters.propertyType} placeholder="e.g. Condo" className="md:w-32" /></label>
      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1 text-base md:flex-none md:px-6">
          Search
        </Button>
        {hasFilters && (
          <Link
            href={action}
            className="flex min-h-11 items-center rounded-md border border-border px-4 text-sm hover:border-primary"
          >
            Clear
          </Link>
        )}
      </div>
    </form>
  )
}
