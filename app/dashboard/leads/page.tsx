import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { canReviewLeads } from '@/lib/lead-access'
import { db } from '@/lib/db'
import { contactMessages } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Private lead review', robots: { index: false, follow: false } }

export default async function LeadReviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  if (!canReviewLeads(session.user.id)) notFound()

  let leads: (typeof contactMessages.$inferSelect)[]
  try {
    leads = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt), desc(contactMessages.id)).limit(100)
  } catch {
    return <main className="mx-auto max-w-4xl p-6"><h1>Lead review temporarily unavailable</h1><p>We could not load the records. Please try again later.</p></main>
  }
  return <main className="mx-auto max-w-4xl space-y-6 p-6">
    <h1 className="text-3xl">Private lead review</h1>
    <p>Latest 100 contact inquiries. Only explicitly authorized accounts can view this page.</p>
    {!leads.length && <p>No contact inquiries found.</p>}
    {leads.map((lead) => <article key={lead.id} className="space-y-2 rounded border p-4 break-words">
      <h2 className="font-bold">NARA-{lead.id} · {lead.topic}</h2>
      <p>{lead.createdAt.toISOString()}</p><p>{lead.name} · {lead.email}</p>
      {lead.phone && <p>{lead.phone}</p>}<p className="whitespace-pre-wrap">{lead.message}</p>
    </article>)}
  </main>
}
