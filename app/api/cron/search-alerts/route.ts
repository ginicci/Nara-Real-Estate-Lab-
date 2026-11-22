import { timingSafeEqual } from 'node:crypto'
import { deliverSearchAlerts } from '@/lib/search-alerts'
export const dynamic='force-dynamic'
export const maxDuration=300
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET
 if(!secret || secret.length<32)return new Response('Unauthorized',{status:401})
 const actual=Buffer.from(request.headers.get('authorization')??''),expected=Buffer.from(`Bearer ${secret}`)
 if(actual.length!==expected.length || !timingSafeEqual(actual,expected))return new Response('Unauthorized',{status:401})
 try{return Response.json(await deliverSearchAlerts())}catch{return Response.json({error:'Search alert delivery failed'},{status:503})}
}
