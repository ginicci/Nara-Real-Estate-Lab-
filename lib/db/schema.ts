import { boolean, integer, numeric, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

// Better Auth owns nara_user, nara_session, nara_account and nara_verification
// (mapped via modelName in lib/auth.ts). These are the app tables.

export const waitlist = pgTable('nara_waitlist', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  interest: text('interest'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export const contactMessages = pgTable('nara_contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export const savedSearches = pgTable('nara_saved_searches', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  location: text('location').notNull(),
  maxPrice: integer('maxPrice'),
  notify: boolean('notify').notNull().default(true),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
})

export type SavedSearch = typeof savedSearches.$inferSelect

// source = 'sample' marks the original fictional rows; they are kept but never shown publicly.
export const listings = pgTable(
  'nara_listings',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    neighborhood: text('neighborhood').notNull(),
    city: text('city').notNull(),
    dealType: text('dealType', { enum: ['buy', 'rent'] }).notNull(),
    price: integer('price').notNull(),
    beds: integer('beds'),
    baths: numeric('baths', { precision: 3, scale: 1 }),
    sqft: integer('sqft'),
    summary: text('summary').notNull(),
    description: text('description'),
    image: text('image'),
    status: text('status', { enum: ['active', 'pending', 'sold', 'off_market'] }).notNull().default('active'),
    listedAt: timestamp('listedAt', { withTimezone: true }).notNull().defaultNow(),
    source: text('source').notNull().default('sample'),
    sourceId: text('sourceId'),
    sourceName: text('sourceName'),
    address: text('address'),
    state: text('state'),
    zipCode: text('zipCode'),
    county: text('county'),
    propertyType: text('propertyType'),
    mlsName: text('mlsName'),
    mlsNumber: text('mlsNumber'),
    listingOffice: text('listingOffice'),
    lastVerifiedAt: timestamp('lastVerifiedAt', { withTimezone: true }),
  },
  (t) => [uniqueIndex('nara_listings_source_source_id_idx').on(t.source, t.sourceId)],
)

export type Listing = typeof listings.$inferSelect
