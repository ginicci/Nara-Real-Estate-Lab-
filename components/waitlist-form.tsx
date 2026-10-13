'use client'

import { useActionState } from 'react'
import { joinWaitlist, type FormState } from '@/app/actions/public'
import { Button } from '@/components/ui/button'
import { FormStatus, Honeypot, Select, TextInput } from '@/components/field'

const initial: FormState = { status: 'idle', message: '' }

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initial)

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-primary/40 bg-card p-5">
        <p className="font-serif text-2xl">{state.message}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {"We'll only email you about new listings and early access."}
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <Honeypot />
      <label htmlFor="wl-email" className="sr-only">
        Email
      </label>
      <TextInput id="wl-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
      <div className="flex gap-3">
        <label htmlFor="wl-name" className="sr-only">
          First name
        </label>
        <TextInput id="wl-name" name="name" autoComplete="given-name" placeholder="First name" />
        <label htmlFor="wl-interest" className="sr-only">
          I want to
        </label>
        <Select id="wl-interest" name="interest" defaultValue="Buy">
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
          <option value="Rent">Rent</option>
          <option value="Invest">Invest</option>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="min-h-11 text-base">
        {pending ? 'Joining…' : 'Get early access'}
      </Button>
      <FormStatus {...state} />
    </form>
  )
}
