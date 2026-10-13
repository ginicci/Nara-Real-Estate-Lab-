'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteSavedSearch, toggleSavedSearch } from '@/app/actions/searches'
import type { SavedSearch } from '@/lib/db/schema'

export function SavedSearchList({ searches }: { searches: SavedSearch[] }) {
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

function SavedSearchRow({ search }: { search: SavedSearch }) {
  const [pending, startTransition] = useTransition()

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card p-4" aria-busy={pending}>
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
    </li>
  )
}
