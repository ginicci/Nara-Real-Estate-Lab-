import Link from 'next/link'
import { resources } from '@/lib/marketplace'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
export default function Page(){return <><SiteHeader signedIn={false}/><main className="mx-auto max-w-6xl space-y-7 px-5 py-12"><h1 className="text-4xl font-semibold">Investor field notes</h1><p className="text-muted-foreground">Practical foundations for evaluating an opportunity. Educational information, not legal, tax, financial or appraisal advice.</p><div className="grid gap-4 md:grid-cols-3">{resources.map(r=><Link href={`/resources/${r.slug}`} key={r.slug} className="space-y-3 rounded-xl border p-6"><h2 className="text-xl font-medium">{r.title}</h2><p className="text-sm text-muted-foreground">{r.body.slice(0,135)}…</p><p className="text-sm text-primary">Read the guide →</p></Link>)}</div></main><SiteFooter/></>}
