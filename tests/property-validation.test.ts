import { describe, expect, it } from 'vitest'
import { photoMime, propertyIdentity, propertySchema } from '@/lib/property-validation'
const valid = { title:'Elegant home',address:'10 Main St, Unit 2',city:'Washington',state:'dc',zipCode:'20001',neighborhood:'',propertyType:'Condo',dealType:'buy',price:'500000',beds:'2',baths:'1.5',sqft:'1000',summary:'An elegant city home.',description:'',status:'active',sortOrder:'0',expiresAt:'' }
describe('property validation', () => {
 it('parses normal phone form values',()=>expect(propertySchema.parse(valid)).toMatchObject({price:500000,beds:2,baths:1.5,state:'DC'}))
 it.each(['active','pending','sold','rented','inactive'])('accepts %s', status=>expect(propertySchema.safeParse({...valid,status}).success).toBe(true))
 it.each([{price:'-1'},{price:'2147483648'},{beds:'1.5'},{status:'public'},{expiresAt:'invalid'},{zipCode:'bad'}])('rejects invalid field %j', patch=>expect(propertySchema.safeParse({...valid,...patch}).success).toBe(false))
 it('allows missing optional numeric details',()=>expect(propertySchema.parse({...valid,beds:'',baths:'',sqft:''})).toMatchObject({beds:null,baths:null,sqft:null}))
 it('normalizes address punctuation but keeps units and transaction types distinct',()=>{
 expect(propertyIdentity('10 MAIN ST.','DC','DC','20001','buy')).toBe(propertyIdentity('10 Main St','dc','dc','20001','buy'))
 expect(propertyIdentity('10 Main St #2','DC','DC','20001','buy')).not.toBe(propertyIdentity('10 Main St #3','DC','DC','20001','buy'))
 })
 it('rejects SVG, HTML and fake file extensions',()=>{expect(photoMime(Buffer.from('<svg/>'))).toBeNull();expect(photoMime(Buffer.from('<html>'))).toBeNull()})
 it('recognizes supported image signatures',()=>{expect(photoMime(Buffer.from([255,216,255,0]))).toBe('image/jpeg');expect(photoMime(Buffer.from([137,80,78,71,13,10,26,10]))).toBe('image/png');expect(photoMime(Buffer.from('RIFF1234WEBP'))).toBe('image/webp')})
})
