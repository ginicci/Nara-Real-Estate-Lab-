import Link from 'next/link'
import { markets } from '@/lib/marketplace'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
export default function Page(){return <><SiteHeader signedIn={false}/><main className="mx-auto max-w-6xl space-y-7 px-5 py-12"><h1 className="text-4xl font-semibold">Virginia markets</h1><p className="max-w-2xl text-muted-foreground">Explore actual published inventory by location. These pages are discovery tools, not claims of local deal volume, investment returns or market expertise.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{markets.map(m=><Link href={`/markets/${m.toLowerCase().replaceAll(' ','-')}`} className="rounded-xl border p-6 text-xl" key={m}>{m} →</Link>)}</div></main><SiteFooter/></>}
