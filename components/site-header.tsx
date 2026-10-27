import Link from 'next/link'
const links = [['/buy','Buy'],['/sell','Sell'],['/investment','Investment'],['/development','Development'],['/homes','Properties'],['/contact','Contact']]
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
      <Link href="/" aria-label="Nara Real Estate home" className="flex min-h-11 items-center gap-3"><span className="font-serif text-4xl">Nara<span className="text-primary">.</span></span><span className="border-l pl-3 text-[10px] uppercase tracking-[.22em]">Real Estate<br />Virginia & beyond</span></Link>
      <nav aria-label="Main" className="hidden items-center gap-4 text-sm lg:flex">{links.map(([href,label])=><Link key={href} href={href} className="flex min-h-11 items-center text-muted-foreground hover:text-primary">{label}</Link>)}</nav>
      <Link href={signedIn?'/dashboard':'/sign-in'} className="flex min-h-11 items-center rounded-full border px-4 text-sm hover:border-primary">{signedIn?'My searches':'Sign in'}</Link>
      <details className="w-full border-t pt-2 lg:hidden"><summary className="min-h-11 cursor-pointer py-3 text-sm">Explore Nara</summary><nav aria-label="Mobile" className="grid grid-cols-2 gap-2 pb-3">{links.map(([href,label])=><Link key={href} href={href} className="flex min-h-11 items-center rounded-md border px-3 text-sm">{label}</Link>)}</nav></details>
    </div>
  </header>
}
