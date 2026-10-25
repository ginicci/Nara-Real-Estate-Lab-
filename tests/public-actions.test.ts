import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => {
  const where = vi.fn()
  const returning = vi.fn()
  const values = vi.fn(() => ({ returning }))
  const execute = vi.fn(async () => ({}))
  const tx = { execute, select: vi.fn(() => ({ from: () => ({ where }) })), insert: vi.fn(() => ({ values })) }
  const transaction = vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx))
  const sendEmail = vi.fn(async () => ({ ok: false }))
  const inbox = { value: undefined as string | undefined }
  return { where, returning, values, execute, tx, transaction, sendEmail, inbox }
})
vi.mock('@/lib/db', () => ({ db: { transaction: mocks.transaction } }))
vi.mock('@/lib/email/send', () => ({ inboxAddress: () => mocks.inbox.value, sendEmail: mocks.sendEmail }))
import { sendContactMessage } from '@/app/actions/public'
const initial = { status: 'idle' as const, message: '' }
function form(topic = 'Sales') {
  const data = new FormData()
  Object.entries({ name: 'Test', email: 'test@example.com', phone: '', topic, message: 'An inquiry for testing.' }).forEach(([key, value]) => data.set(key, value))
  return data
}
beforeEach(() => {
  vi.clearAllMocks()
  mocks.inbox.value = undefined
  mocks.sendEmail.mockResolvedValue({ ok: false })
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
  it.each(['Sales', 'Investment', 'Development'])('alerts the inbox for %s and reports notification only when the provider accepts it', async (topic) => {
    mocks.inbox.value = 'team@example.com'
    mocks.sendEmail.mockResolvedValue({ ok: true })
    const result = await sendContactMessage(initial, form(topic))
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'team@example.com', replyTo: 'test@example.com', idempotencyKey: 'contact-alert/123' }))
    expect(result.message).toContain(`${topic} inquiry is saved`)
    expect(result.message).toContain('Our team has been notified')
  })
  it('keeps the honest warning when the provider rejects the alert', async () => {
    mocks.inbox.value = 'team@example.com'
    const result = await sendContactMessage(initial, form())
    expect(result.status).toBe('success')
    expect(result.message).toContain('not yet configured or delivery-verified')
  })
  it('rejects invalid topics before a database call', async () => {
    expect((await sendContactMessage(initial, form('invalid'))).status).toBe('error')
    expect(mocks.transaction).not.toHaveBeenCalled()
  })
  it('enforces the hourly limit inside a per-email locked transaction', async () => {
    mocks.where.mockResolvedValue([{ n: 3 }])
    expect((await sendContactMessage(initial, form())).message).toContain('try again later')
    expect(mocks.execute).toHaveBeenCalledTimes(1)
    expect(mocks.tx.insert).not.toHaveBeenCalled()
    expect(mocks.sendEmail).not.toHaveBeenCalled()
  })
  it('handles database failure without leaking details', async () => {
    mocks.where.mockRejectedValue(new Error('private database error'))
    const result = await sendContactMessage(initial, form())
    expect(result.status).toBe('error')
    expect(result.message).toContain('could not save')
    expect(result.message).not.toContain('private')
  })
})
