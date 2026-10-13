import Image from 'next/image'
import { House } from 'lucide-react'

type Props = { src: string | null; alt: string; sizes: string; priority?: boolean; className?: string }

export function ListingPhoto({ src, alt, sizes, priority, className }: Props) {
  if (!src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <House className="size-6" aria-hidden="true" />
        <p className="text-xs uppercase tracking-wider">No photo from listing source</p>
      </div>
    )
  }
  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />
}
