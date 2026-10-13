import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : null))

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email('Enter a valid email'))

export const waitlistSchema = z.object({
  email: emailField,
  name: optionalText(80),
  interest: optionalText(40),
})

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  email: emailField,
  phone: optionalText(30),
  topic: z.enum(['Buying', 'Selling', 'Renting', 'Other']),
  message: z.string().trim().min(10, 'Tell us a bit more (10+ characters)').max(4000),
})

export const searchSchema = z.object({
  location: z.string().trim().min(2, 'Enter a city or neighborhood').max(80),
  maxPrice: z
    .string()
    .trim()
    .transform((v) => v.replace(/[^\d]/g, ''))
    .transform((v) => (v ? Number(v) : null))
    .refine(
      (v) => v === null || (Number.isSafeInteger(v) && v > 0 && v <= 100_000_000),
      'Enter a valid price',
    ),
})

export const recordIdSchema = z.number().int().positive().max(2_147_483_647)

export const CONTACT_LIMIT_PER_HOUR = 3
