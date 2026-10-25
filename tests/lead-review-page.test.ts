import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  select: vi.fn(() => ({ from: () => ({ orderBy: () => ({ limit: async () => [] }) }) })),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND')
  }),
}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect, notFound: mocks.notFound }))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mocks.getSession } } }))
vi.mock('@/lib/db', () => ({ db: { select: mocks.select } }))
vi.mock('@/lib/db/schema', () => ({ contactMessages: { createdAt: 'created_at', id: 'id' } }))
import LeadReviewPage from '@/app/dashboard/leads/page'

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})
describe('/dashboard/leads access control (mocked session and database)', () => {
  it('redirects signed-out visitors before any lead query', async () => {
    mocks.getSession.mockResolvedValue(null)
    await expect(LeadReviewPage()).rejects.toThrow('REDIRECT:/sign-in')
    expect(mocks.select).not.toHaveBeenCalled()
  })
  it('hides the page from signed-in users when the allowlist is empty', async () => {
    vi.stubEnv('NARA_ADMIN_USER_IDS', '')
    mocks.getSession.mockResolvedValue({ user: { id: 'ordinary-user' } })
    await expect(LeadReviewPage()).rejects.toThrow('NOT_FOUND')
    expect(mocks.select).not.toHaveBeenCalled()
  })
  it('hides the page from users who are not allowlisted, even with a matching email', async () => {
    vi.stubEnv('NARA_ADMIN_USER_IDS', 'owner-id')
    mocks.getSession.mockResolvedValue({ user: { id: 'someone-else', email: 'owner-id' } })
    await expect(LeadReviewPage()).rejects.toThrow('NOT_FOUND')
    expect(mocks.select).not.toHaveBeenCalled()
  })
  it('queries leads only for an allowlisted immutable user ID', async () => {
    vi.stubEnv('NARA_ADMIN_USER_IDS', 'owner-id')
    mocks.getSession.mockResolvedValue({ user: { id: 'owner-id' } })
    await expect(LeadReviewPage()).resolves.toBeTruthy()
    expect(mocks.select).toHaveBeenCalledTimes(1)
  })
})
