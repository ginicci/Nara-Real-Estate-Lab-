import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (process.env.VERCEL_ENV !== 'production' || !host) return []
  return ['/', '/homes', '/buy', '/sell', '/investment', '/development', '/wholesale', '/contact', '/privacy', '/terms', '/inquiries/sales', '/inquiries/investment', '/inquiries/development'].map((path) => ({ url: `https://${host}${path}` }))
}
