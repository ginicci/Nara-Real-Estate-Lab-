const BRAND = 'Nara Real Estate Lab'

function escape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function layout(title: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#f3f1ec;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1d2621;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#1d2621;padding:20px 28px;color:#d9b46a;font-size:15px;letter-spacing:0.08em;text-transform:uppercase;">${BRAND}</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1d2621;">${escape(title)}</h1>
${body}
</td></tr>
</table>
<p style="font-size:12px;color:#6b726d;margin-top:16px;">${BRAND}</p>
</td></tr></table>
</body></html>`
}

function p(text: string) {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${text}</p>`
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0;"><a href="${escape(href)}" style="display:inline-block;background:#1d2621;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:15px;">${escape(label)}</a></p>`
}

export function waitlistWelcome(name: string | null) {
  const greeting = name ? `Hi ${escape(name)},` : 'Hi there,'
  return {
    subject: `You're on the ${BRAND} list`,
    html: layout(
      "You're on the list",
      p(greeting) +
        p("Thanks for joining. We'll reach out as soon as new listings and early access open up.") +
        p('Reply to this email any time if you have a question.'),
    ),
    text: `${name ? `Hi ${name},` : 'Hi there,'}\n\nThanks for joining the ${BRAND} list. We'll reach out as soon as new listings and early access open up.`,
  }
}

export function waitlistAdminAlert(entry: { email: string; name: string | null; interest: string | null }) {
  return {
    subject: `New waitlist signup: ${entry.email}`,
    html: layout(
      'New waitlist signup',
      p(`<strong>Email:</strong> ${escape(entry.email)}`) +
        p(`<strong>Name:</strong> ${escape(entry.name ?? '—')}`) +
        p(`<strong>Interest:</strong> ${escape(entry.interest ?? '—')}`),
    ),
    text: `New waitlist signup\nEmail: ${entry.email}\nName: ${entry.name ?? '-'}\nInterest: ${entry.interest ?? '-'}`,
  }
}

export function contactAdminAlert(msg: {
  name: string
  email: string
  phone: string | null
  topic: string
  message: string
}) {
  return {
    subject: `New inquiry (${msg.topic}) from ${msg.name}`,
    html: layout(
      'New contact inquiry',
      p(`<strong>Name:</strong> ${escape(msg.name)}`) +
        p(`<strong>Email:</strong> ${escape(msg.email)}`) +
        p(`<strong>Phone:</strong> ${escape(msg.phone ?? '—')}`) +
        p(`<strong>Topic:</strong> ${escape(msg.topic)}`) +
        p(escape(msg.message).replace(/\n/g, '<br/>')),
    ),
    text: `New contact inquiry\nName: ${msg.name}\nEmail: ${msg.email}\nPhone: ${msg.phone ?? '-'}\nTopic: ${msg.topic}\n\n${msg.message}`,
  }
}

export function contactReceipt(name: string) {
  return {
    subject: `We got your message — ${BRAND}`,
    html: layout(
      'Thanks for reaching out',
      p(`Hi ${escape(name)},`) +
        p('We received your message and an agent will get back to you within one business day.'),
    ),
    text: `Hi ${name},\n\nWe received your message and an agent will get back to you within one business day.`,
  }
}

export function verifyEmail(url: string) {
  return {
    subject: `Confirm your email for ${BRAND}`,
    html: layout(
      'Confirm your email',
      p('Tap the button below to confirm your email address.') +
        button(url, 'Confirm email') +
        p(`<span style="font-size:13px;color:#6b726d;">If you didn't create an account, you can ignore this email.</span>`),
    ),
    text: `Confirm your email for ${BRAND}:\n${url}`,
  }
}

export function resetPassword(url: string) {
  return {
    subject: `Reset your ${BRAND} password`,
    html: layout(
      'Reset your password',
      p('Someone asked to reset the password for your account. Tap below to choose a new one. The link expires in 1 hour.') +
        button(url, 'Reset password') +
        p(`<span style="font-size:13px;color:#6b726d;">If this wasn't you, you can ignore this email.</span>`),
    ),
    text: `Reset your ${BRAND} password (expires in 1 hour):\n${url}`,
  }
}

export function savedSearchCreated(search: { location: string; maxPrice: number | null }) {
  const price = search.maxPrice ? ` up to $${search.maxPrice.toLocaleString('en-US')}` : ''
  return {
    subject: `Alerts on: homes in ${search.location}`,
    html: layout(
      'Your search alert is live',
      p(`We'll email you when new homes in <strong>${escape(search.location)}</strong>${escape(price)} hit the market.`) +
        p('You can turn alerts off any time from your dashboard.'),
    ),
    text: `Your search alert is live. We'll email you when new homes in ${search.location}${price} hit the market.`,
  }
}
