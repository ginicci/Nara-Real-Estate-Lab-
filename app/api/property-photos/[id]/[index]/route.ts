import { and, eq, gt, isNull, ne, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { listings } from '@/lib/db/schema'
export const dynamic = 'force-dynamic'
export async function GET(_: Request, { params }: { params: Promise<{ id: string; index: string }> }) {
  const { id, index } = await params
  if (!/^\d+$/.test(id) || !/^[0-7]$/.test(index)) return new Response(null, { status: 404 })
  const [row] = await db.select({ photo: sql<string>`${listings.photos}->>${Number(index)}` }).from(listings).where(and(eq(listings.id,Number(id)),ne(listings.source,'sample'),eq(listings.status,'active'),or(isNull(listings.expiresAt),gt(listings.expiresAt,sql`now()`)))).limit(1)
  const match = row?.photo?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
  if (!match) return new Response(null, { status: 404 })
  return new Response(Buffer.from(match[2],'base64'), { headers: { 'Content-Type': match[1], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}
