'use client'
import { useActionState, useState } from 'react'
import { submitAcquisition } from '@/app/actions/acquisition'
import { investorRoles, strategies } from '@/lib/marketplace'
const inputClass='min-h-11 w-full rounded-md border bg-background p-3 text-sm'
export function AcquisitionForm({kind,market=''}:{kind:'investor'|'seller'|'wholesaler';market?:string}){
 const [state,action,pending]=useActionState(submitAcquisition,{status:'idle' as const,message:''}),[step,setStep]=useState(1)
 function next(e:React.MouseEvent<HTMLButtonElement>){const fieldset=e.currentTarget.closest('fieldset');if(fieldset){for(const el of Array.from(fieldset.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('input,select,textarea'))){if(!el.reportValidity())return}}setStep(2)}
 const text=(name:string,label:string,required=false,type='text',value='')=><label className="flex flex-col gap-2 text-sm" key={name}>{label}{required?' *':''}<input className={inputClass} name={name} type={type} defaultValue={value} required={required} maxLength={name==='authority'?500:200}/></label>
 const select=(name:string,label:string,options:string[],required=false)=><label className="flex flex-col gap-2 text-sm" key={name}>{label}{required?' *':''}<select className={inputClass} name={name} required={required}><option value="">Choose…</option>{options.map(o=><option key={o}>{o}</option>)}</select></label>
 return <form action={action} className="space-y-6 rounded-xl border bg-card/40 p-5 md:p-7">
 <input type="hidden" name="kind" value={kind}/><input className="hidden" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
 <p className="text-xs uppercase tracking-widest text-primary">Step {step} of 2 · {kind==='investor'?'Buying criteria':'Property review'}</p>
 <fieldset className={step===1?'grid gap-4 sm:grid-cols-2':'hidden'}><legend className="mb-4 text-lg font-medium">{kind==='investor'?'Your investment criteria':'Tell us about the property'}</legend>
 {text('location',kind==='investor'?'Target Virginia markets':'Property address and city',true,'text',market)}{text('propertyType','Property type',true)}{text('budget',kind==='investor'?'Acquisition budget range':'Expected / asking or assignment price')}{text('timeline',kind==='investor'?'Purchase timeline':'Selling / closing timeline',true)}
 {kind==='investor'?<>{select('role','Investor profile',investorRoles,true)}{select('strategy','Investment strategy',strategies,true)}</>:<>{select('condition','General condition',['Move-in ready','Cosmetic work','Light rehab','Heavy rehab','Unknown'],true)}{select('occupancy','Occupancy',['Vacant','Owner occupied','Tenant occupied','Unknown'],true)}</>}
 {kind==='wholesaler'&&<>{select('contractStatus','Contract status',['Under contract','Owner','Authorized representative','Not under contract'],true)}{text('expiration','Contract expiration',false,'date')}{text('access','Access and showing arrangements')}{text('authority','Your interest and authority to market (20+ characters)',true)}</>}
 <div className="sm:col-span-2"><button type="button" onClick={next} className="min-h-11 rounded-md bg-primary px-5 text-primary-foreground">Continue →</button></div>
 </fieldset>
 <fieldset className={step===2?'grid gap-4 sm:grid-cols-2':'hidden'}><legend className="mb-4 text-lg font-medium">Your contact information</legend>{text('name','Name',true)}{text('email','Email',true,'email')}{text('phone','Phone')}{select('contactMethod','Preferred contact method',['Email','Phone'],true)}
 <label className="flex flex-col gap-2 text-sm sm:col-span-2">Additional details<textarea name="notes" maxLength={1500} rows={4} className={inputClass}/></label>
 <label className="flex items-start gap-3 text-sm leading-relaxed sm:col-span-2"><input name="consent" type="checkbox" required className="mt-1 size-5 shrink-0"/>I authorize Nara to respond to this inquiry using my contact details. I confirm that the information and my stated relationship to any property are accurate. This is not consent to automated marketing messages.</label>
 <div className="flex gap-3 sm:col-span-2"><button type="button" className="min-h-11 rounded-md border px-5" onClick={()=>setStep(1)}>Back</button><button disabled={pending} className="min-h-11 rounded-md bg-primary px-5 text-primary-foreground disabled:opacity-50">{pending?'Submitting…':'Submit for review'}</button></div>
 </fieldset>
 {['role','strategy','condition','occupancy','contractStatus','expiration','access','authority'].filter(n=>kind==='investor'?!['role','strategy'].includes(n):kind==='seller'?!['condition','occupancy'].includes(n):['role','strategy'].includes(n)).map(n=><input key={n} type="hidden" name={n} value=""/>)}
 <p className="text-xs leading-relaxed text-muted-foreground">Submissions are private review requests, never automatically published. No guaranteed offer, closing, access or return. Document uploads and private deal packets are not enabled; do not send sensitive documents through the contact form.</p>
 {state.message&&<p role={state.status==='error'?'alert':'status'} className="rounded-md border p-4 text-sm">{state.message}{state.status==='error'&&' Review both steps before resubmitting.'}</p>}
 </form>
}
