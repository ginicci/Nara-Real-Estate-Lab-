import { describe, expect, it } from 'vitest'
import { canReviewLeads } from '../lib/lead-access'
describe('private lead access', () => {
  it('denies access without an allowlist', () => expect(canReviewLeads('user1', '')).toBe(false))
  it('requires an exact immutable ID', () => {
    expect(canReviewLeads('user1', ' user1, user2 ')).toBe(true)
    expect(canReviewLeads('user', 'user1,user2')).toBe(false)
    expect(canReviewLeads('', ', ,')).toBe(false)
  })
})
