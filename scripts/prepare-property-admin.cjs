// Explicit one-time build opt-in. Never migrates as a side effect of a normal build.
if (process.env.NARA_MIGRATE_PROPERTIES !== 'true') process.exit(0)
const fs = require('node:fs')
const { Pool } = require('pg')
async function main() {
  if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_PROJECT_ID !== 'prj_CbBtuu7DmvZJRM4HjTnMZi2tMDHy') throw new Error('Wrong Vercel project')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 })
  const client = await pool.connect()
  try {
    const { rows } = await client.query("select to_regclass('public.nara_listings') as listings, to_regclass('public.nara_user') as users")
    if (!rows[0].listings || !rows[0].users) throw new Error('Existing Nara database required; refusing to initialize another database')
    await client.query(fs.readFileSync('db/migrations/0003_property_admin.sql','utf8'))
    console.log('NARA: additive property-admin migration applied.')
    // Exercise database constraints and public visibility with disposable, rolled-back data.
    await client.query('BEGIN')
    const marker = `nara-workflow-test-${crypto.randomUUID()}`
    const { rows: [row] } = await client.query(`INSERT INTO nara_listings (slug,title,neighborhood,city,"dealType",price,summary,source,status,photos,featured,"sortOrder") VALUES ($1,'Temporary workflow test','Test','Test','buy',123000,'Temporary database verification','manual','active',$2,true,-1) RETURNING id`, [marker, JSON.stringify(['data:image/png;base64,iVBORw0KGgo='])])
    const visible = async () => (await client.query(`SELECT count(*)::int AS count FROM nara_listings WHERE id=$1 AND status='active' AND source<>'sample' AND ("expiresAt" IS NULL OR "expiresAt">now())`,[row.id])).rows[0].count === 1
    if (!await visible()) throw new Error('Active listing visibility failed')
    await client.query('UPDATE nara_listings SET price=124000 WHERE id=$1',[row.id])
    for (const status of ['pending','sold','rented','inactive']) {
      await client.query('UPDATE nara_listings SET status=$1 WHERE id=$2',[status,row.id])
      if (await visible()) throw new Error('Inactive visibility failed')
    }
    await client.query(`UPDATE nara_listings SET status='active', "expiresAt"=now()-interval '1 day' WHERE id=$1`,[row.id])
    if (await visible()) throw new Error('Expiration failed')
    await client.query('ROLLBACK')
    console.log('NARA: database create/edit/status/expiration/photo persistence checks passed; test transaction rolled back.')
    const ids = (process.env.NARA_ADMIN_USER_IDS ?? '').split(',').map(s=>s.trim()).filter(Boolean)
    const { rows: [admins] } = await client.query('SELECT count(*)::int AS count FROM nara_user WHERE id=ANY($1::text[]) AND "emailVerified"=true',[ids])
    console.log(`NARA: verified allowlisted admins: ${admins.count}.`)
    if (!admins.count) console.log('NARA SETUP REQUIRED: configure NARA_ADMIN_USER_IDS with trusted verified account IDs before using property management.')
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{})
    // Do not print connection strings, raw server errors or account data.
    throw new Error(`Nara property setup failed (${e.code || 'configuration/check error'}). Migration is idempotent; review database configuration.`)
  } finally {client.release(); await pool.end()}
}
main().catch(e=>{console.error(e.message);process.exit(1)})
