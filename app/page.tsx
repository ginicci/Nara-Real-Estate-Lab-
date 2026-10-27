import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowRight } from 'lucide-react'
import { auth } from '@/lib/auth'
import { findListings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ContactForm } from '@/components/contact-form'

const services = [
  {
    title: 'Buy',
    body: 'Explore available properties and save a search tailored to your priorities.',
  },
  {
    title: 'Sell',
    body: 'A pricing review from an agent who knows the block, not just the zip code.',
  },
  {
    title: 'Rent',
    body: 'Explore rental listings and ask about current availability.',
  },
]

export default async function HomePage() {
  const [session, latest] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    findListings({}, 3),
  ])

  return (
    <>
      <SiteHeader signedIn={Boolean(session?.user)} />
      <main>
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-14 pt-8 md:flex-row md:items-center md:gap-12 md:pt-16">
          <div className="flex flex-col gap-6 md:flex-1">
            <p className="text-sm uppercase tracking-widest text-primary">Nara Real Estate Lab</p>
            <h1 className="font-serif text-5xl leading-none text-balance md:text-7xl">
              Property. Investment. Development.
            </h1>
            <p className="max-w-md leading-relaxed text-muted-foreground text-pretty">
              Distinctive homes. Considered investments. New possibilities. Explore real estate across Virginia, Washington DC and Maryland with a clear view of what comes next.
            </p>
            <div className="flex flex-wrap gap-3"><Link href="/homes" className="flex min-h-12 items-center rounded-full bg-primary px-6 text-primary-foreground">Explore properties <ArrowRight className="ml-3 size-4" /></Link><Link href="/investment" className="flex min-h-12 items-center rounded-full border px-6">Investment & opportunity</Link></div>
            <p className="text-xs uppercase tracking-[.2em] text-muted-foreground">Virginia · Washington DC · Maryland</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:flex-1">
            <Image
              src="/images/hero-home.png"
              alt="Modern home at dusk with warm light in the windows"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        {latest.length > 0 && (
          <section aria-labelledby="just-listed" className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14">
              <div className="flex items-end justify-between gap-4">
                <h2 id="just-listed" className="font-serif text-4xl">
                  Just listed
                </h2>
                <Link href="/homes" className="flex min-h-11 items-center gap-1 text-sm text-primary">
                  See all homes
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="services" className="border-y border-border">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <p className="mb-3 text-xs uppercase tracking-[.25em] text-primary">A broader perspective</p>
            <h2 id="services" className="font-serif text-4xl">
              What we do
            </h2>
            <ul className="mt-8 flex flex-col md:flex-row md:gap-10">
              {services.map((s) => (
                <li key={s.title} className="flex flex-col gap-2 border-t border-border py-6 md:flex-1">
                  <Link href={s.title === 'Rent' ? '/homes?type=rent' : `/${s.title.toLowerCase()}`} className="flex min-h-11 items-center justify-between font-serif text-3xl">{s.title}<ArrowRight className="size-5" /></Link>
    <p className="leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-2">
          <article className="space-y-5 rounded-2xl border bg-card p-7 md:p-10"><p className="text-xs uppercase tracking-widest text-primary">Investment</p><h2 className="font-serif text-4xl">Think beyond the address.</h2><p className="leading-relaxed text-muted-foreground">Discuss acquisition criteria, rental strategy and long-term ownership. Start with your goals, not promised returns.</p><Link href="/investment" className="inline-flex min-h-11 items-center gap-2 text-primary">Explore investment <ArrowRight className="size-4" /></Link></article>
          <article className="space-y-5 rounded-2xl border p-7 md:p-10"><p className="text-xs uppercase tracking-widest text-primary">Development & wholesale</p><h2 className="font-serif text-4xl">See what could be.</h2><p className="leading-relaxed text-muted-foreground">Bring a site, redevelopment idea or property opportunity. Tell us the location, timeline and what you have in mind.</p><Link href="/development" className="inline-flex min-h-11 items-center gap-2 text-primary">Discuss a project <ArrowRight className="size-4" /></Link></article>
        </section>

        <section id="contact" aria-labelledby="contact-heading" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="flex flex-col gap-4 md:flex-1">
              <h2 id="contact-heading" className="font-serif text-4xl text-balance">
                Talk to an agent
              </h2>
              <p className="max-w-sm leading-relaxed text-muted-foreground">
                Tell us about your property, investment goals or next move. Send a private inquiry to begin the conversation.
              </p>
            </div>
            <div className="md:flex-1">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
