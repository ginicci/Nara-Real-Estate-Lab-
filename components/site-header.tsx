import Link from 'next/link'

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex min-h-11 items-center font-serif text-2xl">
          Nara<span className="text-primary">.</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          <Link href="/homes" className="flex min-h-11 items-center px-3 text-muted-foreground hover:text-foreground">
            Homes
          </Link>
          <Link href="/#contact" className="flex min-h-11 items-center px-2 text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <Link
            href={signedIn ? '/dashboard' : '/sign-in'}
            className="flex min-h-11 items-center rounded-full border border-border px-4 hover:border-primary"
          >
            {signedIn ? 'My alerts' : 'Sign in'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
