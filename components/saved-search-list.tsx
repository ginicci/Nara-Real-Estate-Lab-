'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { deleteSavedSearch, toggleSavedSearch } from '@/app/actions/searches'
import type { SavedSearch } from '@/lib/db/schema'

type SearchWithMatches = SavedSearch & { matches: number; href: string }

export function SavedSearchList({ searches }: { searches: SearchWithMatches[] }) {
  if (!searches.length) {
    return <p className="leading-relaxed text-muted-foreground">No alerts yet. Add one above.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {searches.map((s) => (
        <SavedSearchRow key={s.id} search={s} />
      ))}
    </ul>
  )
}

function SavedSearchRow({ search }: { search: SearchWithMatches }) {
  const [pending, startTransition] = useTransition()

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4" aria-busy={pending}>
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate font-medium">{search.location}</p>
          <p className="text-sm text-muted-foreground">
            {search.maxPrice ? `Up to $${search.maxPrice.toLocaleString('en-US')}` : 'Any price'}
          </p>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-5 accent-primary"
            checked={search.notify}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.checked
              startTransition(() => toggleSavedSearch(search.id, next))
            }}
          />
          Email me
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteSavedSearch(search.id))}
          className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-5" aria-hidden="true" />
          <span className="sr-only">Delete alert for {search.location}</span>
        </button>
      </div>
      <Link
        href={search.href}
        className="flex min-h-11 items-center justify-between rounded-md border-t border-border pt-3 text-sm text-primary"
      >
        {search.matches === 0
          ? 'No homes for sale match yet'
          : search.matches === 1
            ? '1 home for sale matches'
            : `${search.matches} homes for sale match`}
        <span aria-hidden="true">{'→'}</span>
      </Link>
    </li>
  )
}
