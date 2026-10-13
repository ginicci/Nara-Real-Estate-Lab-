'use client'

import { useActionState } from 'react'
import { createSavedSearch } from '@/app/actions/searches'
import type { FormState } from '@/app/actions/public'
import { Button } from '@/components/ui/button'
import { Field, FormStatus, TextInput } from '@/components/field'

const initial: FormState = { status: 'idle', message: '' }

export function SavedSearchForm() {
  const [state, action, pending] = useActionState(createSavedSearch, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="City or neighborhood" id="location">
        <TextInput id="location" name="location" required placeholder="e.g. Silver Lake, Los Angeles" />
      </Field>
      <Field label="Max price (optional)" id="maxPrice">
        <TextInput id="maxPrice" name="maxPrice" inputMode="numeric" placeholder="850,000" />
      </Field>
      <Button type="submit" disabled={pending} className="min-h-11 text-base">
        {pending ? 'Saving…' : 'Save alert'}
      </Button>
      <FormStatus {...state} />
    </form>
  )
}
