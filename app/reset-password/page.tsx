import { AuthShell } from '@/components/auth-shell'
import { ResetPasswordForm } from '@/components/reset-password-form'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams
  return (
    <AuthShell title="Choose a new password" subtitle="You'll sign in with it next time.">
      <ResetPasswordForm token={error ? null : (token ?? null)} />
    </AuthShell>
  )
}
