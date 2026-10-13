import Image from 'next/image'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { SiteHeader } from '@/components/site-header'
import { WaitlistForm } from '@/components/waitlist-form'
import { ContactForm } from '@/components/contact-form'

const services = [
  {
    title: 'Buy',
    body: 'Save a search and get an email the moment a matching home is listed.',
  },
  {
    title: 'Sell',
    body: 'A pricing review from an agent who knows the block, not just the zip code.',
  },
  {
    title: 'Rent',
    body: 'Vetted rentals and a straight answer on what is actually available.',
  },
]

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <SiteHeader signedIn={Boolean(session?.user)} />
      <main>
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-14 pt-8 md:flex-row md:items-center md:gap-12 md:pt-16">
          <div className="flex flex-col gap-6 md:flex-1">
            <p className="text-sm uppercase tracking-widest text-primary">Nara Real Estate Lab</p>
            <h1 className="font-serif text-5xl leading-none text-balance md:text-7xl">
              Find the house before it finds everyone else.
            </h1>
            <p className="max-w-md leading-relaxed text-muted-foreground text-pretty">
              Early access to new listings, honest pricing, and a local team that answers. Join the list to hear first.
            </p>
            <WaitlistForm />
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

        <section aria-labelledby="services" className="border-y border-border">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 id="services" className="font-serif text-4xl">
              What we do
            </h2>
            <ul className="mt-8 flex flex-col md:flex-row md:gap-10">
              {services.map((s) => (
                <li key={s.title} className="flex flex-col gap-2 border-t border-border py-6 md:flex-1">
                  <h3 className="text-lg font-medium">{s.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-heading" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="flex flex-col gap-4 md:flex-1">
              <h2 id="contact-heading" className="font-serif text-4xl text-balance">
                Talk to an agent
              </h2>
              <p className="max-w-sm leading-relaxed text-muted-foreground">
                Tell us what you need. A real person replies within one business day, and you get a copy of your message.
              </p>
            </div>
            <div className="md:flex-1">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
          <p>{'© 2026 Nara Real Estate Lab'}</p>
          <p>Ginicci Labs</p>
        </div>
      </footer>
    </>
  )
}
