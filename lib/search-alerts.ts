import 'server-only'
import { pool } from '@/lib/db'
import { findListings } from '@/lib/listings'
import { sendEmail } from '@/lib/email/send'
export async function deliverSearchAlerts() {
 if(!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return {sent:0, skipped:'Email provider and verified sender are required'}
 const host=process.env.VERCEL_PROJECT_PRODUCTION_URL
 if(!host || process.env.VERCEL_ENV !== 'production') return {sent:0,skipped:'Production only'}
 const client=await pool.connect()
 let sent=0
 try {
  const lock=await client.query('SELECT pg_try_advisory_lock(746272) AS locked')
  if(!lock.rows[0].locked)return {sent,skipped:'Another delivery is running'}
  const {rows}=await client.query(`SELECT s.*, u.email FROM nara_saved_searches s JOIN nara_user u ON u.id=s."userId" WHERE s.notify=true AND u."emailVerified"=true ORDER BY s.id LIMIT 100`)
  for(const search of rows){
   const results=await findListings({location:search.location,type:'buy',maxPrice:search.maxPrice ?? undefined},100)
   for(const listing of results){
    if(listing.listedAt < search.createdAt)continue
    const existing=await client.query('SELECT 1 FROM nara_alert_deliveries WHERE "searchId"=$1 AND "listingId"=$2',[search.id,listing.id])
    if(existing.rowCount)continue
    const response=await sendEmail({to:search.email,subject:'A new property matches your Nara search',text:`${listing.title}\n${listing.city}\n$${listing.price.toLocaleString('en-US')}\nhttps://${host}/homes/${listing.slug}\n\nManage or pause this search: https://${host}/dashboard`,html:`<p>A new property matches your saved search.</p><p><a href="https://${host}/homes/${encodeURIComponent(listing.slug)}">View property details</a></p><p><a href="https://${host}/dashboard">Manage or pause alerts</a></p>`,idempotencyKey:`nara-match/${search.id}/${listing.id}`})
    if(response.ok){await client.query('INSERT INTO nara_alert_deliveries ("searchId","listingId") VALUES ($1,$2) ON CONFLICT DO NOTHING',[search.id,listing.id]);sent++}
   }
  }
  return {sent}
 }finally{await client.query('SELECT pg_advisory_unlock(746272)').catch(()=>{});client.release()}
}
