import { beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(()=>{
 const session = vi.fn(), where = vi.fn(), values = vi.fn(), set = vi.fn(()=>({where:vi.fn()})), revalidate=vi.fn()
 const tx = { execute:vi.fn(),select:vi.fn(()=>({from:()=>({where})})),insert:vi.fn(()=>({values})),update:vi.fn(()=>({set})) }
 const transaction=vi.fn(async (fn:(t:typeof tx)=>unknown)=>fn(tx))
 return {session,where,values,set,tx,transaction,revalidate}
})
vi.mock('next/headers',()=>({headers:async()=>new Headers()}))
vi.mock('next/cache',()=>({revalidatePath:mocks.revalidate}))
vi.mock('@/lib/auth',()=>({auth:{api:{getSession:mocks.session}}}))
vi.mock('@/lib/db',()=>({db:{transaction:mocks.transaction}}))
import { saveProperty } from '@/app/dashboard/properties/actions'
function form(){const f=new FormData();Object.entries({id:'0',title:'Elegant home',address:'10 Main St',city:'Washington',state:'DC',zipCode:'20001',neighborhood:'',propertyType:'Condo',dealType:'buy',price:'500000',beds:'2',baths:'1.5',sqft:'1000',summary:'An elegant city home.',description:'',status:'active',sortOrder:'0',expiresAt:''}).forEach(([k,v])=>f.set(k,v));return f}
beforeEach(()=>{vi.clearAllMocks();process.env.NARA_ADMIN_USER_IDS='trusted';mocks.session.mockResolvedValue({user:{id:'trusted',emailVerified:true}});mocks.where.mockResolvedValue([])})
it.each([null,{user:{id:'stranger',emailVerified:true}},{user:{id:'trusted',emailVerified:false}}])('denies unauthorized mutation %j',async session=>{mocks.session.mockResolvedValue(session);expect((await saveProperty({},form())).error).toContain('admin access');expect(mocks.transaction).not.toHaveBeenCalled()})
it('creates a database listing and refreshes public pages',async()=>{expect((await saveProperty({},form())).success).toContain('saved');expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({source:'manual',managed:true,price:500000,status:'active'}));expect(mocks.revalidate).toHaveBeenCalledWith('/homes','layout')})
it('prevents normalized duplicate addresses',async()=>{mocks.where.mockResolvedValue([{id:42,address:'10 MAIN ST.',city:'Washington',state:'DC',zip:'20001',deal:'buy'}]);expect((await saveProperty({},form())).error).toContain('#42');expect(mocks.values).not.toHaveBeenCalled()})
it('does not overwrite simultaneous edits',async()=>{const f=form();f.set('id','1');f.set('version','old');mocks.where.mockResolvedValue([{source:'manual',updatedAt:new Date()}]);expect((await saveProperty({},f)).error).toContain('Another admin');expect(mocks.set).not.toHaveBeenCalled()})
it('saves statuses, ordering, photos and expiration on edits without feed overwrite',async()=>{const f=form();f.set('id','1');f.set('version','2026-01-01T00:00:00.000Z');f.set('status','rented');f.set('featured','on');f.set('sortOrder','2');f.set('expiresAt','2027-01-01');mocks.where.mockResolvedValueOnce([{source:'rentcast',sourceId:'original',sourceName:'RentCast',updatedAt:new Date('2026-01-01'),photos:['data:image/jpeg;base64,/9j/'],image:'cover'}]).mockResolvedValueOnce([]);expect((await saveProperty({},f)).success).toBeTruthy();expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({source:'rentcast',sourceId:'original',managed:true,status:'rented',featured:true,sortOrder:2,photos:['data:image/jpeg;base64,/9j/']}))})
it('rejects oversized photos',async()=>{const f=form();f.set('photos',new File([new Uint8Array(2*1024*1024+1)],'photo.jpg'));expect((await saveProperty({},f)).error).toContain('2 MB');expect(mocks.transaction).not.toHaveBeenCalled()})
it('rejects unsafe photo content',async()=>{const f=form();f.set('photos',new File(['<svg/>'],'photo.jpg',{type:'image/jpeg'}));expect((await saveProperty({},f)).error).toContain('JPEG');expect(mocks.transaction).not.toHaveBeenCalled()})
it('uploads photo bytes into the existing database',async()=>{const f=form();f.set('photos',new File([new Uint8Array([255,216,255,0])],'photo.jpg'));expect((await saveProperty({},f)).success).toBeTruthy();expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({photos:['data:image/jpeg;base64,/9j/AA=='],image:'data:image/jpeg;base64,/9j/AA=='}))})
