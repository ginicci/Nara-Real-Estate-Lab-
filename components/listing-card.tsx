import Image from 'next/image'
import Link from 'next/link'
import type { Listing } from '@/lib/db/schema'
import { formatBaths, formatPrice } from '@/lib/listing-filters'

export function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  return (
    <li className="flex">
      <Link
        href={`/homes/${listing.slug}`}
        className="group flex w-full flex-col gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={listing.image || '/placeholder.svg'}
            alt={`${listing.title} in ${listing.neighborhood}`}
            fill
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
            <p className="text-sm text-muted-foreground">{listing.neighborhood}</p>
          </div>
          <p className="font-medium text-pretty group-hover:text-primary">{listing.title}</p>
          <p className="text-sm text-muted-foreground">
            {listing.beds} bd · {formatBaths(listing.baths)} ba · {listing.sqft.toLocaleString('en-US')} sq ft
          </p>
        </div>
      </Link>
    </li>
  )
}
