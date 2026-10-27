import Link from 'next/link'
export function SiteFooter() {
  return <footer className="border-t bg-card/40"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
    <div><Link href="/" className="font-serif text-4xl">Nara.</Link><p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">Property. Investment. Development.<br />A considered approach to real estate in Virginia, Washington DC and Maryland.</p></div>
    <nav aria-label="Footer" className="grid grid-cols-2 gap-3 text-sm">{[['/buy','Buy'],['/sell','Sell'],['/homes','Properties'],['/investment','Investment'],['/development','Development'],['/wholesale','Wholesale'],['/contact','Contact'],['/dashboard','Saved searches']].map(([href,label])=><Link key={href} href={href} className="py-1 hover:text-primary">{label}</Link>)}</nav>
    <div className="space-y-3 text-xs leading-relaxed text-muted-foreground"><p>Equal housing opportunity. Availability and details are subject to verification. Investment information is not an offer of securities or a guarantee of returns.</p><div className="flex gap-4"><Link href="/privacy" className="underline">Privacy</Link><Link href="/terms" className="underline">Terms</Link></div><p>© {new Date().getFullYear()} Nara Real Estate Lab</p></div>
  </div></footer>
}
