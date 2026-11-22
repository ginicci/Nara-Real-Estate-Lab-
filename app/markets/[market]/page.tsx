export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { markets } from '@/lib/marketplace'
import { findListings } from '@/lib/listings'
import { ListingCard } from '@/components/listing-card'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
export default async function Page({params}:{params:Promise<{market:string}>}){const slug=(await params).market;const market=markets.find(m=>m.toLowerCase().replaceAll(' ','-')===slug);if(!market)notFound();const rows=await findListings({location:market,state:'VA',manualOnly:true,type:'buy'});return <><SiteHeader signedIn={false}/><main className="mx-auto max-w-6xl space-y-7 px-5 py-12"><Link href="/markets" className="text-sm text-primary">← Virginia markets</Link><h1 className="text-4xl font-semibold">{market} investment opportunities</h1><p className="text-muted-foreground">Published inventory only. No local price statistics or valuations are supplied without supporting data.</p>{rows.length?<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rows.map(r=><ListingCard listing={r} key={r.id}/>)}</ul>:<p className="rounded-xl border p-6">No available opportunities are currently published for this market.</p>}<div className="flex flex-wrap gap-4">{[[`/deals?location=${encodeURIComponent(market)}`,'Search this market'],[`/investors?market=${encodeURIComponent(market)}`,'Join this market’s buyers list'],['/sell-property','Submit your property'],['/submit-deal','Submit a deal'],['/resources','Investor resources']].map(([href,label])=><Link className="rounded-md border px-4 py-3 text-sm" href={href} key={href}>{label}</Link>)}</div></main><SiteFooter/></>}
