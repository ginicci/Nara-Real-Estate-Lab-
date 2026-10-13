import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { getListingBySlug } from '@/lib/listings'
import { formatPrice, formatVerified, listingFacts } from '@/lib/listing-filters'
import { ListingPhoto } from '@/components/listing-photo'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ContactForm } from '@/components/contact-form'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListingBySlug((await params).slug)
  if (!listing) return { title: 'Home not found — Nara Real Estate Lab' }
  return {
    title: `${listing.title}, ${listing.city} — Nara Real Estate Lab`,
    description: listing.summary,
    ...(listing.image ? { openGraph: { images: [listing.image] } } : {}),
  }
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params
  const [listing, session] = await Promise.all([
    getListingBySlug(slug),
    auth.api.getSession({ headers: await headers() }),
  ])
  if (!listing) notFound()

  const facts = listingFacts(listing)
  const isRent = listing.dealType === 'rent'
  const available = listing.status === 'active'
  const verified = formatVerified(listing.lastVerifiedAt)
  const place = [listing.city, listing.state].filter(Boolean).join(', ')

  return (
    <>
      <SiteHeader signedIn={Boolean(session?.user)} />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-6 md:py-10">
        <Link
          href="/homes"
          className="flex min-h-11 w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All homes
        </Link>

        <div className="relative -mx-5 aspect-[4/3] overflow-hidden bg-muted md:mx-0 md:aspect-[16/8] md:rounded-2xl">
          <ListingPhoto
            src={listing.image}
            alt={`${listing.title}, ${place}`}
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <article className="flex flex-col gap-6 md:flex-[3]">
            <div className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-widest text-primary">
                {available ? (isRent ? 'For rent' : 'For sale') : 'No longer listed'} · {place}
              </p>
              <h1 className="font-serif text-4xl leading-tight text-balance md:text-5xl">{listing.title}</h1>
              {listing.address && <p className="text-muted-foreground">{listing.address}</p>}
              <p className="font-serif text-4xl leading-none">{formatPrice(listing.price, listing.dealType)}</p>
            </div>

            {!available && (
              <p role="status" className="rounded-xl border border-border bg-muted p-4 text-sm leading-relaxed">
                {"This listing wasn't in the latest feed as active, so it may be sold, rented or withdrawn."}
              </p>
            )}

            {facts.length > 0 && (
              <dl className="flex border-y border-border">
                {facts.map((f) => (
                  <div key={f.label} className="flex flex-1 flex-col gap-1 border-r border-border py-4 pl-4 first:pl-0 last:border-r-0">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                    <dd className="text-xl font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="text-lg leading-relaxed text-pretty">{listing.summary}</p>
            {listing.description && (
              <p className="leading-relaxed text-muted-foreground text-pretty">{listing.description}</p>
            )}

            <section aria-label="Listing source" className="flex flex-col gap-1 border-t border-border pt-4 text-sm text-muted-foreground">
              <p>
                Listing data from {listing.sourceName ?? 'a third-party feed'}
                {verified ? `, last checked ${verified}` : ''}.
              </p>
              {listing.listingOffice && <p>Listed by {listing.listingOffice}.</p>}
              {listing.mlsName && listing.mlsNumber && (
                <p>
                  {listing.mlsName} #{listing.mlsNumber}
                </p>
              )}
              <p>Details can change. Confirm price and availability with us before you act on them.</p>
            </section>
          </article>

          <aside aria-labelledby="ask-heading" className="flex flex-col gap-4 md:flex-[2]">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:sticky md:top-24">
              <h2 id="ask-heading" className="font-serif text-3xl text-balance">
                {isRent ? 'Ask about this rental' : 'Ask about this home'}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                An agent replies within one business day, and you get a copy by email.
              </p>
              <ContactForm
                topic={isRent ? 'Renting' : 'Buying'}
                defaultMessage={`I'd like to know more about ${listing.address ?? `${listing.title}, ${place}`}.`}
              />
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
