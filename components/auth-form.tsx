'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/field'

type Mode = 'sign-in' | 'sign-up'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    const { error } = isSignUp
      ? await authClient.signUp.email({
          email,
          password,
          name: String(form.get('name') ?? ''),
          callbackURL: '/dashboard',
        })
      : await authClient.signIn.email({ email, password })

    setPending(false)
    if (error) {
      setError(
        isSignUp
          ? 'Could not create that account. Try a different email or a longer password.'
          : 'Email or password is incorrect.',
      )
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {isSignUp && (
        <Field label="Name" id="name">
          <TextInput id="name" name="name" required autoComplete="name" />
        </Field>
      )}
      <Field label="Email" id="email">
        <TextInput id="email" name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password" id="password" hint={isSignUp ? 'At least 8 characters.' : undefined}>
        <TextInput
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
      </Field>
      {!isSignUp && (
        <Link href="/forgot-password" className="flex min-h-11 items-center self-start text-sm text-primary">
          Forgot password?
        </Link>
      )}
      <Button type="submit" disabled={pending} className="min-h-11 text-base">
        {pending ? 'One moment…' : isSignUp ? 'Create account' : 'Sign in'}
      </Button>
      <p aria-live="polite" className="text-sm text-destructive">
        {error}
      </p>
      <p className="text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account? ' : 'New here? '}
        <Link href={isSignUp ? '/sign-in' : '/sign-up'} className="text-primary underline-offset-4 hover:underline">
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  )
}
