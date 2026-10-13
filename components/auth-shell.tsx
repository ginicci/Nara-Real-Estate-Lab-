import Link from 'next/link'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-5 py-10">
      <Link href="/" className="flex min-h-11 items-center self-start font-serif text-2xl">
        Nara<span className="text-primary">.</span>
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl text-balance">{title}</h1>
        <p className="leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </main>
  )
}
