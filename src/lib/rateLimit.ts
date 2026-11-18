/**
 * Rate limit sederhana in-memory.
 *
 * Cukup untuk menahan spam form RSVP dan endpoint statistik pada satu instance
 * server. Bila aplikasi dijalankan multi-instance, pindahkan ke Redis/Upstash.
 */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

function cleanup(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
  // Jaga memori tetap terbatas bila serangan mengirim banyak IP berbeda.
  if (buckets.size > MAX_BUCKETS) {
    const overflow = buckets.size - MAX_BUCKETS
    let removed = 0
    for (const key of buckets.keys()) {
      buckets.delete(key)
      removed += 1
      if (removed >= overflow) break
    }
  }
}

/**
 * Mengembalikan `true` bila request masih boleh lanjut.
 *
 * @param key pengenal unik (mis. `rsvp:<ip>:<slug>`)
 * @param limit jumlah maksimal request dalam window
 * @param windowMs panjang window dalam milidetik
 */
export function consumeRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) cleanup(now)
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}

/** IP klien dari header proxy (Coolify/Traefik) atau koneksi langsung. */
export function clientIPFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown'
}
