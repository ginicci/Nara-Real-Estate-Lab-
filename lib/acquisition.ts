import { z } from 'zod'
import { investorRoles } from '@/lib/marketplace'
export const acquisitionSchema = z.object({
 kind:z.enum(['investor','seller','wholesaler']),name:z.string().trim().min(1).max(80),email:z.email().max(254),phone:z.string().trim().max(30),
 location:z.string().trim().min(2).max(200),propertyType:z.string().trim().min(2).max(80),budget:z.string().trim().max(80),timeline:z.string().trim().min(2).max(100),
 role:z.string().max(80),strategy:z.string().max(80),condition:z.string().max(100),occupancy:z.string().max(100),contractStatus:z.string().max(100),expiration:z.string().max(30),access:z.string().max(200),authority:z.string().max(500),contactMethod:z.enum(['Email','Phone']),notes:z.string().trim().max(1500),consent:z.literal('on'),
}).superRefine((v,ctx)=>{
 if(v.kind==='investor'&&!investorRoles.includes(v.role))ctx.addIssue({code:'custom',path:['role'],message:'Choose an investor role.'})
 if(v.kind==='wholesaler'&&(!v.contractStatus||v.authority.length<20))ctx.addIssue({code:'custom',path:['authority'],message:'Describe your contractual interest and marketing authority (20+ characters).'})
 if(v.kind==='seller'&&(!v.condition||!v.occupancy))ctx.addIssue({code:'custom',path:['condition'],message:'Describe condition and occupancy.'})
 if(v.contactMethod==='Phone'&&!v.phone)ctx.addIssue({code:'custom',path:['phone'],message:'Enter a phone number or choose Email.'})
})
export function acquisitionMessage(v:z.infer<typeof acquisitionSchema>){
 return [`NARA ${v.kind.toUpperCase()} REVIEW REQUEST — not approved for publication`,...Object.entries(v).filter(([k,val])=>!['name','email','phone','consent','kind'].includes(k)&&val).map(([k,val])=>`${k}: ${val}`),'Permission to respond to this inquiry: granted. No automatic marketing subscription or authority verification implied.'].join('\n')
}
