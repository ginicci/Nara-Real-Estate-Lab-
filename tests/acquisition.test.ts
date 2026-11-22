import { expect,it } from 'vitest'
import { acquisitionSchema,acquisitionMessage } from '@/lib/acquisition'
import { parseListingFilters } from '@/lib/listing-filters'
const base={kind:'investor',name:'Test Buyer',email:'buyer@example.com',phone:'',location:'Arlington',propertyType:'Condo',budget:'500000',timeline:'Within 90 days',role:'Cash Buyer',strategy:'Rental',condition:'',occupancy:'',contractStatus:'',expiration:'',access:'',authority:'',contactMethod:'Email',notes:'',consent:'on'}
it('accepts investor criteria and preserves review-only disclosure',()=>{const v=acquisitionSchema.parse(base);expect(acquisitionMessage(v)).toContain('not approved for publication');expect(acquisitionMessage(v)).toContain('role: Cash Buyer')})
it('requires consent and a valid role',()=>{expect(acquisitionSchema.safeParse({...base,consent:''}).success).toBe(false);expect(acquisitionSchema.safeParse({...base,role:'Invented'}).success).toBe(false)})
it('requires wholesaler marketing authority',()=>{expect(acquisitionSchema.safeParse({...base,kind:'wholesaler'}).success).toBe(false);expect(acquisitionSchema.safeParse({...base,kind:'wholesaler',contractStatus:'Under contract',authority:'I hold a contract subject to attorney review.'}).success).toBe(true)})
it('requires seller condition and occupancy',()=>{expect(acquisitionSchema.safeParse({...base,kind:'seller'}).success).toBe(false)})
it('requires a phone for a phone response',()=>expect(acquisitionSchema.safeParse({...base,contactMethod:'Phone'}).success).toBe(false))
it('parses price/type filters without interpolating SQL',()=>expect(parseListingFilters({minPrice:'100000',propertyType:'Condo'})).toMatchObject({minPrice:100000,propertyType:'Condo'}))
