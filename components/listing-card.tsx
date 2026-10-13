import Link from 'next/link'
import type { Listing } from '@/lib/db/schema'
import { formatPrice, listingFacts } from '@/lib/listing-filters'
import { ListingPhoto } from '@/components/listing-photo'

export function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  const facts = listingFacts(listing)
  return (
    <li className="flex">
      <Link
        href={`/homes/${listing.slug}`}
        className="group flex w-full flex-col gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          <ListingPhoto
            src={listing.image}
            alt={`${listing.title}, ${listing.city}`}
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
            {listing.dealType === 'rent' ? 'For rent' : 'For sale'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-serif text-3xl leading-none">{formatPrice(listing.price, listing.dealType)}</p>
            <p className="truncate text-sm text-muted-foreground">
              {listing.city}
              {listing.state ? `, ${listing.state}` : ''}
            </p>
          </div>
          <p className="font-medium text-pretty group-hover:text-primary">{listing.title}</p>
          {facts.length > 0 && (
            <p className="text-sm text-muted-foreground">{facts.map((f) => f.short).join(' · ')}</p>
          )}
        </div>
      </Link>
    </li>
  )
}
