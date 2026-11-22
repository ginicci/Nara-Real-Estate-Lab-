'use server'
import { acquisitionMessage, acquisitionSchema } from '@/lib/acquisition'
import { sendContactMessage, type FormState } from './public'
export async function submitAcquisition(prev:FormState,form:FormData):Promise<FormState>{
 const parsed=acquisitionSchema.safeParse(Object.fromEntries(form))
 if(!parsed.success)return {status:'error',message:parsed.error.issues[0]?.message??'Check your information.'}
 const v=parsed.data,data=new FormData()
 data.set('name',v.name);data.set('email',v.email);data.set('phone',v.phone);data.set('topic',v.kind==='investor'?'Investment':v.kind==='seller'?'Selling':'Development');data.set('message',acquisitionMessage(v));data.set('company',String(form.get('company')??''))
 return sendContactMessage(prev,data)
}
