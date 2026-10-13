import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { findListings } from '@/lib/listings'
import { isDemoListing, parseListingFilters } from '@/lib/listing-filters'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ListingCard } from '@/components/listing-card'
import { ListingFiltersForm } from '@/components/listing-filters-form'

export const metadata: Metadata = {
  title: 'Homes for sale and rent — Nara Real Estate Lab',
  description: 'Browse active homes for sale and rent across Washington DC, Maryland and Northern Virginia.',
}

export default async function HomesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseListingFilters(await searchParams)
  const [session, results] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    findListings(filters),
  ])
  const signedIn = Boolean(session?.user)
  const hasDemo = results.some(isDemoListing)

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 md:py-12">
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-5xl leading-none text-balance md:text-6xl">Homes</h1>
          <p className="max-w-md leading-relaxed text-muted-foreground text-pretty">
            Homes for sale and rent across DC, Maryland and Northern Virginia. Confirm details with us before you
            act on them.
          </p>
        </div>

        {hasDemo && (
          <p role="note" className="rounded-xl border border-accent bg-accent/15 p-4 text-sm leading-relaxed">
            <strong className="font-semibold">Preview data.</strong>{' '}
            {"Homes marked “Demo listing” are made up to show how the site works. They aren't real properties."}
          </p>
        )}

        <ListingFiltersForm filters={filters} />

        <p aria-live="polite" className="text-sm text-muted-foreground">
          {results.length === 1 ? '1 home' : `${results.length} homes`}
          {filters.location ? ` in or near ${filters.location}` : ''}
        </p>

        {results.length ? (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} priority={i < 2} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6">
            <p className="font-serif text-3xl text-balance">Nothing matches yet.</p>
            <p className="leading-relaxed text-muted-foreground">
              Save this search as an alert and check back. Listings refresh once a day.
            </p>
            <Link
              href={signedIn ? '/dashboard' : '/sign-up'}
              className="flex min-h-11 items-center rounded-md bg-primary px-5 font-medium text-primary-foreground"
            >
              {signedIn ? 'Create an alert' : 'Create a free account'}
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
