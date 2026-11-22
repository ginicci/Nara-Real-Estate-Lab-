'use client'
import { useActionState } from 'react'
import { saveProperty } from '@/app/dashboard/properties/actions'
import type { Listing } from '@/lib/db/schema'

export function PropertyEditor({ property }: { property?: Listing }) {
  const [result, action, pending] = useActionState(saveProperty, {})
  const p = property
  const fields = [
    ['title','Property title','text',true], ['address','Street address (include unit)','text',true],
    ['city','City','text',true], ['state','State (two letters)','text',true], ['zipCode','ZIP code','text',true],
    ['neighborhood','Neighborhood','text',false], ['propertyType','Property type','text',false],
    ['price','Price ($, whole dollars)','number',true], ['beds','Bedrooms','number',false],
    ['baths','Bathrooms','number',false], ['sqft','Area (sq ft)','number',false],
    ['sortOrder','Display order (lower numbers first)','number',true], ['expiresAt','Automatically hide after (UTC)','date',false],
  ] as const
  return <form action={action} className="space-y-6">
    <input type="hidden" name="id" value={p?.id ?? 0} />
    <input type="hidden" name="version" value={p?.updatedAt.toISOString() ?? ''} />
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([name,label,type,required]) => <label key={name} className="flex flex-col gap-2 text-sm font-medium">
        {label}{required ? ' *' : ''}
        <input name={name} type={type} required={required} step={name === 'baths' ? '0.1' : type === 'number' ? '1' : undefined}
          defaultValue={name === 'expiresAt' ? p?.expiresAt?.toISOString().slice(0,10) ?? '' : String(p?.[name] ?? (name === 'sortOrder' ? 0 : ''))}
          className="min-h-11 rounded-md border bg-background px-3" />
      </label>)}
      <label className="flex flex-col gap-2 text-sm font-medium">Listing type<select name="dealType" defaultValue={p?.dealType ?? 'buy'} className="min-h-11 rounded-md border bg-background px-3"><option value="buy">For sale</option><option value="rent">For rent (monthly price)</option></select></label>
      <label className="flex flex-col gap-2 text-sm font-medium">Availability<select name="status" defaultValue={p?.status === 'off_market' ? 'inactive' : p?.status ?? 'inactive'} className="min-h-11 rounded-md border bg-background px-3">{['active','pending','sold','rented','inactive'].map(s => <option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}</select></label>
    </div>
    <label className="flex flex-col gap-2 text-sm font-medium">Short description *<textarea name="summary" required minLength={10} maxLength={500} defaultValue={p?.summary} rows={3} className="rounded-md border bg-background p-3" /></label>
    <label className="flex flex-col gap-2 text-sm font-medium">Full description<textarea name="description" maxLength={10000} defaultValue={p?.description ?? ''} rows={5} className="rounded-md border bg-background p-3" /></label>
    <fieldset className="space-y-3 rounded-xl border p-4"><legend className="px-2 font-medium">Photos</legend>
      <p className="text-sm text-muted-foreground">Choose up to 8 JPEG, PNG or WebP photos, 2 MB total. First photo is the cover. New uploads replace the gallery; no upload keeps existing photos. HEIC photos must be exported as JPEG.</p>
      {p?.image && <div className="flex gap-2 overflow-x-auto">{(p.photos.length ? p.photos : [p.image]).map((src,i) => <img key={i} src={src} alt={`Current property photo ${i+1}`} className="h-24 w-32 shrink-0 rounded-lg object-cover" />)}</div>}
      <input type="file" name="photos" multiple accept="image/jpeg,image/png,image/webp" className="block min-h-11 max-w-full text-sm" />
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="clearPhotos" />Remove existing photos (unless replacing)</label>
    </fieldset>
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="featured" defaultChecked={p?.featured} />Featured listing (shown first)</label>
    <p className="text-sm text-muted-foreground">Only Active, unexpired properties appear publicly. Pending, Sold, Rented and Inactive properties are hidden, including their detail pages. Use Inactive to remove a property without losing its record.</p>
    {result.error && <p role="alert" className="rounded-lg border border-destructive p-4 text-destructive">{result.error}</p>}
    {result.success && <p role="status" className="rounded-lg border bg-muted p-4">{result.success} <a href="/dashboard/properties" className="underline">Return to properties</a></p>}
    <button disabled={pending} className="min-h-12 rounded-md bg-primary px-6 font-medium text-primary-foreground disabled:opacity-50">{pending ? 'Saving…' : 'Save property'}</button>
  </form>
}
