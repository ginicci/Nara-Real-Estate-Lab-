import { describe, expect, it } from 'vitest'
import { contactAdminAlert, resetPassword, waitlistWelcome } from '@/lib/email/templates'

describe('email templates', () => {
  it('escapes user input in HTML', () => {
    const email = contactAdminAlert({
      name: '<script>alert(1)</script>',
      email: 'a@b.co',
      phone: null,
      topic: 'Buying',
      message: '<img src=x onerror=alert(1)>',
    })
    expect(email.html).not.toContain('<script>')
    expect(email.html).not.toContain('<img')
    expect(email.html).toContain('&lt;script&gt;')
  })

  it('escapes the waitlist name', () => {
    expect(waitlistWelcome('<b>x</b>').html).not.toContain('<b>x</b>')
  })

  it('includes the reset link in both html and text', () => {
    const url = 'https://example.com/reset-password?token=abc'
    const email = resetPassword(url)
    expect(email.text).toContain(url)
    expect(email.html).toContain('href="https://example.com/reset-password?token=abc"')
  })
})
