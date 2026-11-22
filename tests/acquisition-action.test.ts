import { beforeEach,expect,it,vi } from 'vitest'
const mock=vi.hoisted(()=>({send:vi.fn()}))
vi.mock('@/app/actions/public',()=>({sendContactMessage:mock.send}))
import { submitAcquisition } from '@/app/actions/acquisition'
const initial={status:'idle' as const,message:''}
function form(){const f=new FormData();for(const [k,v] of Object.entries({kind:'investor',name:'Buyer',email:'buyer@example.com',phone:'',location:'Richmond',propertyType:'House',budget:'250000',timeline:'90 days',role:'Cash Buyer',strategy:'Rental',condition:'',occupancy:'',contractStatus:'',expiration:'',access:'',authority:'',contactMethod:'Email',notes:'Interested in vacant homes',consent:'on'}))f.set(k,v);return f}
beforeEach(()=>{vi.clearAllMocks();mock.send.mockResolvedValue({status:'success',message:'Saved'})})
it('routes investor criteria to existing private lead storage',async()=>{expect((await submitAcquisition(initial,form())).status).toBe('success');const f=mock.send.mock.calls[0][1];expect(f.get('topic')).toBe('Investment');expect(f.get('message')).toContain('role: Cash Buyer');expect(f.get('message')).toContain('not approved for publication')})
it('does not store invalid or unconsented submissions',async()=>{const f=form();f.delete('consent');expect((await submitAcquisition(initial,f)).status).toBe('error');expect(mock.send).not.toHaveBeenCalled()})
it('preserves database/rate-limit errors rather than claiming saved',async()=>{mock.send.mockResolvedValue({status:'error',message:'Try later'});expect((await submitAcquisition(initial,form())).status).toBe('error')})
