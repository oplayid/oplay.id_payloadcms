/**
 * Memperbaiki index MongoDB pada koleksi `tenants`.
 *
 * Masalah: field `domain` (legacy) memiliki unique index yang tidak sparse.
 * MongoDB menganggap field kosong sebagai null, sehingga hanya SATU dokumen
 * yang boleh tidak punya `domain`. Akibatnya tenant kedua selalu gagal dibuat
 * dengan error `E11000 duplicate key error ... index: domain_1`.
 *
 * Jalankan sekali:
 *   pnpm fix:tenant-indexes
 *
 * Aman dijalankan berulang (idempotent).
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const COLLECTION = 'tenants'
const INDEX_NAME = 'domain_1'

type MongoIndex = {
  name?: string
  unique?: boolean
  key?: Record<string, number>
}

type MongoDb = {
  collection: (name: string) => {
    indexes: () => Promise<MongoIndex[]>
    dropIndex: (name: string) => Promise<unknown>
    createIndex: (
      keys: Record<string, number>,
      options?: Record<string, unknown>,
    ) => Promise<unknown>
  }
}

async function main() {
  const payload = await getPayload({ config })

  const connection = (payload.db as unknown as { connection?: { db?: MongoDb } }).connection
  const db = connection?.db

  if (!db) {
    throw new Error('Koneksi MongoDB tidak tersedia. Pastikan DATABASE_URL valid.')
  }

  const collection = db.collection(COLLECTION)

  let indexes: MongoIndex[] = []
  try {
    indexes = await collection.indexes()
  } catch {
    payload.logger.info(
      `Koleksi "${COLLECTION}" belum ada. Tidak ada index yang perlu diperbaiki.`,
    )
    process.exit(0)
  }

  const domainIndex = indexes.find((index) => index.name === INDEX_NAME)

  if (!domainIndex) {
    await collection.createIndex({ domain: 1 }, { name: INDEX_NAME, background: true })
    payload.logger.info(`Index "${INDEX_NAME}" dibuat sebagai non-unique.`)
  } else if (domainIndex.unique) {
    await collection.dropIndex(INDEX_NAME)
    await collection.createIndex({ domain: 1 }, { name: INDEX_NAME, background: true })
    payload.logger.info(
      `Index "${INDEX_NAME}" yang unique dihapus dan dibuat ulang sebagai non-unique.`,
    )
  } else {
    payload.logger.info(`Index "${INDEX_NAME}" sudah non-unique. Tidak ada perubahan.`)
  }

  // Tenant platform tetap memakai navbar/footer di dalam blok halaman
  // (perilaku lama), jadi layout default-nya "canvas".
  const platform = await payload.find({
    collection: 'tenants',
    where: { type: { equals: 'platform' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const platformTenant = platform.docs[0] as
    | { id: string; defaultLayoutMode?: string | null }
    | undefined

  if (platformTenant && platformTenant.defaultLayoutMode !== 'canvas') {
    await payload.update({
      collection: 'tenants',
      id: platformTenant.id,
      data: { defaultLayoutMode: 'canvas' } as never,
      depth: 0,
      overrideAccess: true,
      context: { skipTenantValidation: true },
    })
    payload.logger.info('Tenant platform diatur ke layout "canvas".')
  }

  const finalIndexes = await collection.indexes()
  payload.logger.info(
    `Index tenants saat ini: ${finalIndexes
      .map((index) => `${index.name}${index.unique ? ' (unique)' : ''}`)
      .join(', ')}`,
  )
}

try {
  await main()
  process.exit(0)
} catch (error) {
  console.error('Gagal memperbaiki index tenants:', error)
  process.exit(1)
}
