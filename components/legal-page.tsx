import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
export function LegalPage({title,children}:{title:string;children:React.ReactNode}){return <><SiteHeader signedIn={false}/><main className="mx-auto max-w-3xl space-y-6 px-5 py-14"><h1 className="font-serif text-5xl">{title}</h1><p className="text-sm text-muted-foreground">Last updated October 27, 2026</p><div className="space-y-6 leading-relaxed text-muted-foreground">{children}</div></main><SiteFooter/></>}
