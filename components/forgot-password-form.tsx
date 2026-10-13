'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/field'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const email = String(new FormData(e.currentTarget).get('email') ?? '')
    await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
    setPending(false)
    // Same message either way so the form never reveals which emails have accounts.
    setSent(true)
  }

  if (sent) {
    return (
      <p aria-live="polite" className="rounded-xl border border-primary/40 bg-card p-5 leading-relaxed">
        If that email has an account, a reset link is on its way. It expires in 1 hour.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Email" id="email">
        <TextInput id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Button type="submit" disabled={pending} className="min-h-11 text-base">
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  )
}
