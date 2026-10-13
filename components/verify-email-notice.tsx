'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export function VerifyEmailNotice({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-primary/40 p-4 text-sm leading-relaxed">
      <p>Confirm your email so alerts reach you. We sent a link to {email}.</p>
      <button
        type="button"
        disabled={status !== 'idle'}
        onClick={async () => {
          setStatus('sending')
          await authClient.sendVerificationEmail({ email, callbackURL: '/dashboard' })
          setStatus('sent')
        }}
        className="flex min-h-11 items-center self-start text-primary disabled:opacity-70"
      >
        {status === 'sent' ? 'Link sent' : status === 'sending' ? 'Sending…' : 'Resend link'}
      </button>
    </div>
  )
}
