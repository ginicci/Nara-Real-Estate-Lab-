import { describe, expect, it } from 'vitest'
import { contactSchema, recordIdSchema, searchSchema, waitlistSchema } from '@/lib/validation'

describe('waitlistSchema', () => {
  it('normalizes email and blanks', () => {
    const r = waitlistSchema.parse({ email: '  Jane@Example.COM ', name: '', interest: 'Buying' })
    expect(r).toEqual({ email: 'jane@example.com', name: null, interest: 'Buying' })
  })

  it('rejects invalid email', () => {
    expect(waitlistSchema.safeParse({ email: 'nope', name: '', interest: '' }).success).toBe(false)
  })
})

describe('contactSchema', () => {
  const valid = { name: 'Jane', email: 'jane@example.com', phone: '', topic: 'Buying', message: 'Looking for a 2 bed.' }

  it('accepts a valid message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects unknown topics', () => {
    expect(contactSchema.safeParse({ ...valid, topic: 'Hacking' }).success).toBe(false)
  })

  it('rejects short and oversized messages', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false)
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(4001) }).success).toBe(false)
  })
})

describe('searchSchema', () => {
  it('parses formatted prices', () => {
    expect(searchSchema.parse({ location: 'Silver Lake', maxPrice: '$850,000' })).toEqual({
      location: 'Silver Lake',
      maxPrice: 850000,
    })
  })

  it('allows an empty price', () => {
    expect(searchSchema.parse({ location: 'Echo Park', maxPrice: '' }).maxPrice).toBeNull()
  })

  it('rejects out-of-range prices', () => {
    expect(searchSchema.safeParse({ location: 'Echo Park', maxPrice: '0' }).success).toBe(false)
    expect(searchSchema.safeParse({ location: 'Echo Park', maxPrice: '999999999999' }).success).toBe(false)
  })
})

describe('recordIdSchema', () => {
  it('only accepts positive integers', () => {
    expect(recordIdSchema.safeParse(5).success).toBe(true)
    expect(recordIdSchema.safeParse(-1).success).toBe(false)
    expect(recordIdSchema.safeParse(1.5).success).toBe(false)
  })
})
