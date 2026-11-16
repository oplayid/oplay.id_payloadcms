import { commitTransaction, initTransaction, killTransaction } from 'payload'
import type { PayloadRequest } from 'payload'

/**
 * Menjalankan beberapa operasi Local API dalam SATU transaksi.
 *
 * Penting untuk MongoDB replika: beberapa transaksi terpisah yang dijalankan
 * berurutan cepat dalam satu proses dapat memicu
 * `NoSuchTransaction: ... does not match any in-progress transactions`.
 * Semua operasi di dalam `fn` juga harus meneruskan `req` yang sama.
 *
 * Bila request sudah punya transaksi (mis. dipanggil dari hook), transaksi
 * tersebut dipakai apa adanya dan tidak di-commit di sini.
 */
export async function withTransaction<T>(
  req: PayloadRequest,
  fn: () => Promise<T>,
): Promise<T> {
  const shouldCommit = await initTransaction(req)

  try {
    const result = await fn()
    if (shouldCommit) await commitTransaction(req)
    return result
  } catch (error) {
    if (shouldCommit) await killTransaction(req)
    throw error
  }
}
