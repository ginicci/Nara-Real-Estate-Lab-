import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/contact-form'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

const categories = { sales: 'Sales', investment: 'Investment', development: 'Development' } as const
export default async function InquiryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  if (!Object.hasOwn(categories, category)) notFound()
  const topic = categories[category as keyof typeof categories]
  return <><SiteHeader signedIn={false} /><main className="mx-auto max-w-2xl space-y-6 px-5 py-8">
    <h1 className="font-serif text-4xl">{topic} inquiry</h1>
    <nav aria-label="Inquiry categories" className="flex flex-wrap gap-4">
      {Object.entries(categories).map(([slug, label]) => <Link key={slug} href={`/inquiries/${slug}`} aria-current={slug === category ? 'page' : undefined}>{label}</Link>)}
    </nav>
    <p>Submissions are saved. Email alerts are not yet configured or delivery-verified.</p>
    <ContactForm key={category} topic={topic} />
  </main><SiteFooter /></>
}
