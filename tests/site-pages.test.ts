import { expect,it } from 'vitest'
import { readFileSync } from 'node:fs'
it('applies both loaded font variables and allows zoom',()=>{const s=readFileSync('app/layout.tsx','utf8');expect(s).toContain('${geist.variable} ${instrumentSerif.variable}');expect(s).not.toContain('maximumScale')})
it('contains requested service routes and working inquiry forms',()=>{const s=readFileSync('app/(services)/[service]/page.tsx','utf8');for(const route of ['buy','sell','investment','development','wholesale','contact'])expect(s).toContain(` ${route}:`);expect(s).toContain('<ContactForm topic={data.topic}/>');expect(s).toContain('notFound()')})
it('does not include Ginicci footer branding or invented returns',()=>{expect(readFileSync('components/site-footer.tsx','utf8')).not.toContain('Ginicci');expect(readFileSync('app/page.tsx','utf8')).toContain('Property. Investment. Development.')})
it('normal builds cannot initialize or migrate any database',()=>{const scripts=JSON.parse(readFileSync('package.json','utf8')).scripts;expect(scripts.build).toBe('next build');expect(readFileSync('app/layout.tsx','utf8')).not.toContain('prepare-property-admin')})
