import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => {
  const where = vi.fn()
  const returning = vi.fn()
  const values = vi.fn(() => ({ returning }))
  return { where, returning, values, select: vi.fn(() => ({ from: () => ({ where }) })), insert: vi.fn(() => ({ values })) }
})
vi.mock('@/lib/db', () => ({ db: { select: mocks.select, insert: mocks.insert } }))
vi.mock('@/lib/email/send', () => ({ inboxAddress: () => undefined, sendEmail: vi.fn(async () => ({ ok: false })) }))
import { sendContactMessage } from '@/app/actions/public'
const initial = { status: 'idle' as const, message: '' }
function form(topic = 'Sales') {
  const data = new FormData()
  Object.entries({ name: 'Test', email: 'test@example.com', phone: '', topic, message: 'An inquiry for testing.' }).forEach(([key, value]) => data.set(key, value))
  return data
}
beforeEach(() => {
  vi.clearAllMocks()
  mocks.where.mockResolvedValue([{ n: 0 }])
  mocks.returning.mockResolvedValue([{ id: 123 }])
})
describe('inquiry submissions (mock database, no real leads created)', () => {
  it.each(['Sales', 'Investment', 'Development'])('saves %s with its category and reference, without claiming delivery', async (topic) => {
    const result = await sendContactMessage(initial, form(topic))
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ topic }))
    expect(result.status).toBe('success')
    expect(result.message).toContain('NARA-123')
    expect(result.message).toContain('not yet configured or delivery-verified')
  })
  it('rejects invalid topics before a database call', async () => {
    expect((await sendContactMessage(initial, form('invalid'))).status).toBe('error')
    expect(mocks.select).not.toHaveBeenCalled()
  })
  it('retains the existing per-email hourly limit', async () => {
    mocks.where.mockResolvedValue([{ n: 3 }])
    expect((await sendContactMessage(initial, form())).message).toContain('try again later')
    expect(mocks.insert).not.toHaveBeenCalled()
  })
  it('handles database failure without leaking details', async () => {
    mocks.where.mockRejectedValue(new Error('private database error'))
    const result = await sendContactMessage(initial, form())
    expect(result.status).toBe('error')
    expect(result.message).toContain('could not save')
    expect(result.message).not.toContain('private')
  })
})
