'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function SignOutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut()
        router.push('/')
        router.refresh()
      }}
      className="flex min-h-11 items-center rounded-full border border-border px-4 text-sm hover:border-primary"
    >
      Sign out
    </button>
  )
}
