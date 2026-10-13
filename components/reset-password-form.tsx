'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/field'

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (!token) {
    return (
      <p className="leading-relaxed text-muted-foreground">
        This link is invalid or has expired.{' '}
        <Link href="/forgot-password" className="text-primary">
          Request a new one
        </Link>
        .
      </p>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const newPassword = String(new FormData(e.currentTarget).get('password') ?? '')
    const { error } = await authClient.resetPassword({ newPassword, token: token! })
    setPending(false)
    if (error) {
      setError('That link is invalid or expired. Request a new one.')
      return
    }
    router.push('/sign-in')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="New password" id="password" hint="At least 8 characters.">
        <TextInput id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </Field>
      <Button type="submit" disabled={pending} className="min-h-11 text-base">
        {pending ? 'Saving…' : 'Save new password'}
      </Button>
      <p aria-live="polite" className="text-sm text-destructive">
        {error}
      </p>
    </form>
  )
}
