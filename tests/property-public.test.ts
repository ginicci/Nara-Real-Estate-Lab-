import { beforeEach, expect, it, vi } from 'vitest'
import { PgDialect } from 'drizzle-orm/pg-core'
const mocks=vi.hoisted(()=>{
 const limit=vi.fn(),offset=vi.fn(),where=vi.fn()
 const select=vi.fn(()=>({from:()=>({where:(query:unknown)=>{where(query);return {orderBy:()=>({limit:()=>({offset})}),limit}}})}))
 return {select,where,limit,offset}
})
vi.mock('server-only',()=>({}))
vi.mock('@/lib/db',()=>({db:{select:mocks.select}}))
import { findListings, getListingBySlug } from '@/lib/listings'
import { GET } from '@/app/api/property-photos/[id]/[index]/route'
beforeEach(()=>{vi.clearAllMocks();mocks.limit.mockResolvedValue([]);mocks.offset.mockResolvedValue([])})
function lastQuery(){return new PgDialect().sqlToQuery(mocks.where.mock.calls.at(-1)![0] as never)}
it('hides non-active, expired and sample detail pages at database query level',async()=>{expect(await getListingBySlug('old')).toBeNull();const q=lastQuery();expect(q.sql).toContain('"status" =');expect(q.params).toContain('active');expect(q.params).toContain('sample');expect(q.sql).toContain('"expiresAt"');expect(q.sql).toContain('now()')})
it('applies visitor search, price, sale/rent and pagination',async()=>{await findListings({location:'Main',type:'rent',maxPrice:3000},48,48);const q=lastQuery();expect(q.params).toContain('%Main%');expect(q.params).toContain('rent');expect(q.params).toContain(3000);expect(q.sql).toContain('"address"');expect(mocks.offset).toHaveBeenCalledWith(48)})
it('uses lightweight URLs rather than base64 in public pages',async()=>{mocks.offset.mockResolvedValue([{id:5,image:null,photoCount:2}]);const rows=await findListings({});expect(rows[0].image).toBe('/api/property-photos/5/0');expect(rows[0].photos).toEqual(['/api/property-photos/5/0','/api/property-photos/5/1'])})
it('returns photos with no caching and active-only visibility',async()=>{mocks.limit.mockResolvedValue([{photo:'data:image/jpeg;base64,/9j/AA=='}]);const response=await GET(new Request('http://localhost'),{params:Promise.resolve({id:'5',index:'0'})});expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store');expect(response.headers.get('content-type')).toBe('image/jpeg');expect(lastQuery().params).toContain('active')})
it('returns 404 for hidden or missing photos',async()=>expect((await GET(new Request('http://localhost'),{params:Promise.resolve({id:'5',index:'0'})})).status).toBe(404))
it('rejects invalid photo selectors without a database call',async()=>{expect((await GET(new Request('http://localhost'),{params:Promise.resolve({id:'bad',index:'9'})})).status).toBe(404);expect(mocks.select).not.toHaveBeenCalled()})
