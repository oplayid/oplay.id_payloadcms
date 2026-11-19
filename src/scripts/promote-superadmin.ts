import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Memberi role superadmin kepada sebuah akun.
 *
 * Dipakai untuk recovery setelah fallback `SUPERADMIN_EMAILS` dihapus, atau
 * saat instalasi baru perlu akun superadmin pertama.
 *
 *   pnpm promote:superadmin --email=admin@example.com
 *
 * Script ini butuh akses CLI ke database produksi (DATABASE_URL di .env),
 * jadi tidak bisa dipanggil oleh pengguna biasa lewat UI/API publik.
 */
async function main() {
  const emailArg = process.argv.find((arg) => arg.startsWith('--email='))
  const email = emailArg?.slice('--email='.length).trim().toLowerCase()

  if (!email || !email.includes('@')) {
    console.error('Usage: pnpm promote:superadmin --email=<email>')
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  const user = found.docs[0]
  if (!user) {
    console.error(`User dengan email "${email}" tidak ditemukan.`)
    process.exit(1)
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { role: 'superadmin' },
    overrideAccess: true,
  })

  console.log(`Berhasil: ${email} sekarang menjadi superadmin.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Gagal memberi role superadmin:', error)
    process.exit(1)
  })
