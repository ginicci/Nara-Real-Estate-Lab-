import { cn } from '@/lib/utils'

const control =
  'w-full min-h-11 rounded-md border border-input bg-secondary px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

type FieldProps = { label: string; id: string; hint?: string; children: React.ReactNode }

export function Field({ label, id, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function TextInput({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(control, className)} {...props} />
}

export function TextArea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'min-h-32 leading-relaxed', className)} {...props} />
}

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return <select className={cn(control, className)} {...props} />
}

// Hidden from people, tempting for bots. Submissions with a value are dropped.
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="company">Company</label>
      <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  )
}

export function FormStatus({ status, message }: { status: string; message: string }) {
  if (status === 'idle' || !message) return <p aria-live="polite" className="sr-only" />
  return (
    <p
      aria-live="polite"
      className={cn('text-sm', status === 'error' ? 'text-destructive' : 'text-primary')}
    >
      {message}
    </p>
  )
}
