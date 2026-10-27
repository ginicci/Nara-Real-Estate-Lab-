import Link from 'next/link'
export function SiteFooter() {
  return <footer className="border-t bg-card/40"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
    <div><Link href="/" className="font-serif text-4xl">Nara.</Link><p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">Virginia wholesale & off-market opportunities.<br />A considered approach to property sourcing and investment due diligence.</p></div>
    <nav aria-label="Footer" className="grid grid-cols-2 gap-3 text-sm">{[['/deals','Investment Deals'],['/sell-property','Sell a Property'],['/submit-deal','Submit a Deal'],['/investors','Buyers List'],['/markets','Markets'],['/resources','Resources'],['/contact','Contact'],['/dashboard','Saved searches']].map(([href,label])=><Link key={href} href={href} className="py-1 hover:text-primary">{label}</Link>)}</nav>
    <div className="space-y-3 text-xs leading-relaxed text-muted-foreground"><p>Equal housing opportunity. Availability and details are subject to verification. Investment information is not an offer of securities or a guarantee of returns.</p><div className="flex gap-4"><Link href="/privacy" className="underline">Privacy</Link><Link href="/terms" className="underline">Terms</Link></div><p>© {new Date().getFullYear()} Nara Real Estate Lab</p></div>
  </div></footer>
}
