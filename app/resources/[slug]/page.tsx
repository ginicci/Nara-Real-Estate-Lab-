import Link from 'next/link'
import { notFound } from 'next/navigation'
import { resources } from '@/lib/marketplace'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
export default async function Page({params}:{params:Promise<{slug:string}>}){const slug=(await params).slug;const article=resources.find(r=>r.slug===slug);if(!article)notFound();return <><SiteHeader signedIn={false}/><main className="mx-auto max-w-3xl space-y-6 px-5 py-12"><Link href="/resources" className="text-sm text-primary">← Resources</Link><h1 className="text-4xl font-semibold leading-tight">{article.title}</h1><p className="text-lg leading-loose text-muted-foreground">{article.body}</p><p className="rounded-xl border p-5 text-sm leading-relaxed">General education only. Transaction structure and Virginia-specific wholesaling, assignment, licensing and advertising requirements need review by qualified counsel. Verify facts independently before committing funds.</p><Link href="/deals" className="inline-flex min-h-11 items-center text-primary">Explore investment opportunities →</Link></main><SiteFooter/></>}
