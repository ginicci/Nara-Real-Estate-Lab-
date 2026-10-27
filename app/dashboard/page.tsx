import Link from 'next/link'
import { canReviewLeads } from '@/lib/lead-access'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getSavedSearches } from '@/app/actions/searches'
import { countListings } from '@/lib/listings'
import { listingsHref } from '@/lib/listing-filters'
import { SiteHeader } from '@/components/site-header'
import { SavedSearchForm } from '@/components/saved-search-form'
import { SavedSearchList } from '@/components/saved-search-list'
import { SignOutButton } from '@/components/sign-out-button'
import { VerifyEmailNotice } from '@/components/verify-email-notice'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const saved = await getSavedSearches()
  const searches = await Promise.all(
    saved.map(async (s) => {
      const filters = { location: s.location, type: 'buy' as const, maxPrice: s.maxPrice ?? undefined }
      return { ...s, matches: await countListings(filters), href: listingsHref(filters) }
    }),
  )

  return (
    <>
      <SiteHeader signedIn />
      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-4xl text-balance">Your saved searches</h1>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {!session.user.emailVerified && <VerifyEmailNotice email={session.user.email} />}

        {session.user.emailVerified && canReviewLeads(session.user.id) && <Link href="/dashboard/properties" className="rounded-xl border bg-card p-5 font-medium">Manage properties →</Link>}

        <p className="text-sm leading-relaxed text-muted-foreground">Saved searches show current matching homes. Email delivery requires a verified account and configured production email service; matching-property notifications run daily, not instantly.</p>
        <section aria-labelledby="new-alert" className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <h2 id="new-alert" className="text-lg font-medium">
            New search alert
          </h2>
          <SavedSearchForm />
        </section>

        <section aria-labelledby="saved" className="flex flex-col gap-4">
          <h2 id="saved" className="text-lg font-medium">
            Saved searches
          </h2>
          <SavedSearchList searches={searches} />
        </section>
      </main>
    </>
  )
}
