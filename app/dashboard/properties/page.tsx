import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { asc, desc, eq, ne } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { canReviewLeads } from '@/lib/lead-access'
import { db } from '@/lib/db'
import { listings } from '@/lib/db/schema'
import { PropertyEditor } from '@/components/property-editor'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Property management — Nara', robots: { index: false, follow: false } }
export default async function PropertiesAdmin({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string; q?: string; status?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  if (!session.user.emailVerified || !canReviewLeads(session.user.id)) notFound()
  const params = await searchParams
  const id = params.edit ? Number(params.edit) : undefined
  if (id !== undefined && (!Number.isInteger(id) || id < 1)) notFound()
  const [property] = id ? await db.select().from(listings).where(eq(listings.id,id)) : []
  if (id && (!property || property.source === 'sample')) notFound()
  const editing = id !== undefined || params.new === '1'
  // Do not send stored photo data to the management list.
  const rows = editing ? [] : await db.select({ id: listings.id, title: listings.title, address: listings.address, city: listings.city, status: listings.status, featured: listings.featured, sortOrder: listings.sortOrder, expiresAt: listings.expiresAt, source: listings.source }).from(listings).where(ne(listings.source,'sample')).orderBy(desc(listings.featured),asc(listings.sortOrder),desc(listings.id))
  const q = (params.q ?? '').toLowerCase()
  const visible = rows.filter(r => (!params.status || r.status === params.status) && `${r.title} ${r.address} ${r.city}`.toLowerCase().includes(q))
  return <main className="mx-auto max-w-5xl space-y-8 px-5 py-8 md:py-12">
    <nav className="flex flex-wrap gap-5 text-sm"><Link href="/dashboard" className="underline">Your dashboard</Link><Link href="/homes" className="underline">View public homes</Link>{editing && <Link href="/dashboard/properties" className="underline">All properties</Link>}</nav>
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Nara · Private workspace</p><h1 className="font-serif text-4xl md:text-5xl">{editing ? property ? 'Edit property' : 'Add new property' : 'Your properties'}</h1></div>{!editing && <Link href="/dashboard/properties?new=1" className="flex min-h-12 items-center rounded-md bg-primary px-5 text-primary-foreground">+ Add New Property</Link>}</header>
    {editing ? <PropertyEditor key={property?.id ?? 'new'} property={property} /> : <>
      <p className="text-muted-foreground">Manage availability, photos and pricing here. Saved changes appear on the website automatically. Featured homes appear first, then display order (lowest first).</p>
      <form className="flex flex-wrap gap-3"><label className="flex flex-1 flex-col gap-1 text-sm">Search properties<input name="q" defaultValue={params.q} placeholder="Title, address or city" className="min-h-11 rounded-md border px-3" /></label><label className="flex flex-col gap-1 text-sm">Status<select name="status" defaultValue={params.status ?? ''} className="min-h-11 rounded-md border px-3"><option value="">All statuses</option>{['active','pending','sold','rented','inactive','off_market'].map(s => <option key={s}>{s}</option>)}</select></label><button className="self-end min-h-11 rounded-md border px-5">Search</button></form>
      <p className="text-sm text-muted-foreground">{visible.length} properties</p>
      <ul className="space-y-3">{visible.map(r => <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"><div className="min-w-0 break-words"><h2 className="font-serif text-2xl">{r.title}</h2><p className="text-sm text-muted-foreground">{r.address} · {r.city}</p><p className="mt-2 text-sm capitalize">{r.status === 'off_market' ? 'Inactive' : r.status}{r.expiresAt && r.expiresAt <= new Date() ? ' · Expired (hidden)' : ''}{r.featured ? ' · Featured' : ''} · Order {r.sortOrder} · #{r.id}</p>{r.source !== 'manual' && <p className="text-xs text-muted-foreground">Feed listing: saving takes ownership so future syncs cannot overwrite your edits.</p>}</div><Link href={`/dashboard/properties?edit=${r.id}`} className="flex min-h-11 items-center rounded-md border px-5">Edit property</Link></li>)}</ul>
      {!visible.length && <p className="rounded-xl border p-6">No matching properties. Add your first property above.</p>}
    </>}
  </main>
}
