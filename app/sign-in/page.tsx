import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { AuthShell } from '@/components/auth-shell'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your search alerts.">
      <AuthForm mode="sign-in" />
    </AuthShell>
  )
}
