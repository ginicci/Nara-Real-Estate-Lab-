import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { resetPassword, verifyEmail } from '@/lib/email/templates'

// Vercel exposes VERCEL_PROJECT_PRODUCTION_URL on preview builds too, so a
// preview must use its own deployment URL or verify/reset links would send
// testers to production.
const isPreview = process.env.VERCEL_ENV === 'preview'

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (isPreview && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.V0_RUNTIME_URL),
  user: { modelName: 'nara_user' },
  session: {
    modelName: 'nara_session',
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  account: { modelName: 'nara_account' },
  verification: { modelName: 'nara_verification' },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // Left off so sign-in works before a sending domain is verified in Resend.
    requireEmailVerification: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      const email = resetPassword(url)
      const sent = await sendEmail({ to: user.email, ...email })
      if (!sent.ok) throw new Error('Email delivery is unavailable. Contact Nara for assistance.')
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const email = verifyEmail(url)
      const sent = await sendEmail({ to: user.email, ...email })
      if (!sent.ok) throw new Error('Email delivery is unavailable. Contact Nara for assistance.')
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
