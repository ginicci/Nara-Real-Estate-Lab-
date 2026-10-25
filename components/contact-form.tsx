'use client'

import { useActionState } from 'react'
import { sendContactMessage, type FormState } from '@/app/actions/public'
import { Button } from '@/components/ui/button'
import { Field, FormStatus, Honeypot, Select, TextArea, TextInput } from '@/components/field'

const initial: FormState = { status: 'idle', message: '' }

type ContactFormProps = {
  topic?: 'Sales' | 'Investment' | 'Development' | 'Buying' | 'Selling' | 'Renting' | 'Other'
  defaultMessage?: string
}

export function ContactForm({ topic = 'Buying', defaultMessage }: ContactFormProps) {
  const [state, action, pending] = useActionState(sendContactMessage, initial)

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-primary/40 bg-card p-6">
        <p className="font-serif text-3xl">Submission saved.</p>
        <p className="mt-2 leading-relaxed text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} className="relative flex flex-col gap-4">
      <Honeypot />
      <Field label="Name" id="c-name">
        <TextInput id="c-name" name="name" required autoComplete="name" />
      </Field>
      <Field label="Email" id="c-email">
        <TextInput id="c-email" name="email" type="email" required autoComplete="email" />
      </Field>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Field label="Phone (optional)" id="c-phone">
            <TextInput id="c-phone" name="phone" type="tel" autoComplete="tel" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Topic" id="c-topic">
            <Select id="c-topic" name="topic" defaultValue={topic}>
              <option>Sales</option>
              <option>Investment</option>
              <option>Development</option>
              <option>Buying</option>
              <option>Selling</option>
              <option>Renting</option>
              <option>Other</option>
            </Select>
          </Field>
        </div>
      </div>
      <Field label="Message" id="c-message">
        <TextArea id="c-message" name="message" required
          minLength={10}
          defaultValue={defaultMessage}
          placeholder="What are you looking for?"
        />
      </Field>
      <Button type="submit" disabled={pending} className="min-h-11 text-base">
        {pending ? 'Sending…' : 'Send message'}
      </Button>
      <FormStatus {...state} />
    </form>
  )
}
