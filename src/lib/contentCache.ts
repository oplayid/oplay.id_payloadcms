import { unstable_cache } from 'next/cache'

/**
 * Tag cache konten. Setiap perubahan dokumen di Payload memanggil
 * `invalidateContent` dengan tag yang sesuai agar pengunjung langsung
 * melihat versi terbaru.
 */
export const CACHE_TAGS = {
  tenants: 'tenants',
  pages: 'pages',
  redirects: 'redirects',
  themes: 'themes',
  /**
   * Konten yang punya URL sendiri (artikel, dan koleksi lain yang didaftarkan
   * di `lib/routableCollections`). Tag dipakai untuk cache detail + listing.
   */
  posts: 'posts',
  /** Acara undangan (judul, tanggal, lokasi, halaman desain). */
  events: 'events',
  /** Tamu undangan + status RSVP. */
  invitations: 'invitations',
} as const

/**
 * Cache lintas request aktif secara default. Set `CONTENT_CACHE=off` untuk
 * mematikan (mis. saat debugging data yang tidak ikut ter-invalidate).
 */
export function isContentCacheEnabled(): boolean {
  return process.env.CONTENT_CACHE !== 'off'
}

type CacheQueryOptions = {
  /** Namespace cache, harus unik per jenis query. */
  key: string
  /** Tag untuk invalidasi on-demand. */
  tags: readonly string[]
  /** TTL pengaman bila invalidasi tag terlewat. Default 5 menit. */
  revalidate?: number
}

/**
 * Membungkus query database dengan cache lintas request.
 *
 * Argumen fungsi otomatis menjadi bagian dari cache key, jadi query yang sama
 * untuk tenant/path berbeda tidak saling menimpa. Saat cache dimatikan,
 * fungsi asli dipanggil langsung tanpa overhead.
 */
export function cacheQuery<Args extends unknown[], Result>(
  { key, tags, revalidate = 300 }: CacheQueryOptions,
  query: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  if (!isContentCacheEnabled()) return query

  return unstable_cache(query, [key], {
    tags: [...tags],
    revalidate,
  })
}

/**
 * Menandai cache sebagai basi.
 *
 * `expire: 0` dipakai agar perubahan konten langsung terlihat (tidak ada
 * stale-while-revalidate), sesuai ekspektasi editor CMS.
 *
 * Aman dipanggil di luar konteks request Next (script CLI / `payload run`):
 * error diabaikan karena tidak ada cache yang perlu dibersihkan.
 */
export async function invalidateContent(tags: readonly string[]): Promise<void> {
  if (tags.length === 0) return
  if (!isContentCacheEnabled()) return

  // Di luar runtime server Next (mis. `payload run` untuk script/migrasi) tidak
  // ada cache yang perlu dibersihkan. Memanggil `revalidateTag` di sana juga
  // mengganggu pembukuan sesi transaksi MongoDB milik Payload.
  if (!process.env.NEXT_RUNTIME) return

  try {
    const { revalidateTag } = await import('next/cache')
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 })
    }
  } catch {
    // Tidak ada cache dalam proses ini.
  }
}
