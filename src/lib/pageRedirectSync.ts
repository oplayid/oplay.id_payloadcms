import type { Payload, PayloadRequest } from 'payload'
import type { Page } from '@/payload-types'
import { extractPagePath } from './pagePaths'

/**
 * Menyelaraskan redirect setelah halaman dibuat/diubah.
 *
 * Modul ini sengaja tidak mengimpor `@payload-config` atau `lib/site` agar aman
 * dipakai langsung dari koleksi `Pages` (menghindari impor melingkar).
 *
 * Aturan:
 * - Rename / pindah halaman -> redirect `path lama -> path baru`.
 * - Redirect berantai dirapikan: kalau A -> B lalu B -> C, A langsung -> C.
 * - Redirect yang bentrok dengan path halaman aktif dihapus, supaya halaman
 *   baru tidak "tertutup" redirect lama.
 */

async function deleteRedirectFrom({
  payload,
  req,
  tenantID,
  from,
}: {
  payload: Payload
  req: PayloadRequest
  tenantID: string
  from: string
}): Promise<void> {
  await payload.delete({
    collection: 'redirects',
    where: {
      and: [{ tenant: { equals: tenantID } }, { from: { equals: from } }],
    },
    overrideAccess: true,
    req,
  })
}

/**
 * Menyelaraskan redirect setelah halaman dibuat/diubah.
 *
 * @param previousDoc kondisi halaman sebelum perubahan (undefined saat create)
 */
export async function syncRedirectForPathChange({
  payload,
  req,
  previousPath,
  nextPath,
  tenantID,
}: {
  payload: Payload
  req: PayloadRequest
  previousPath?: string | null
  nextPath?: string | null
  tenantID: string
}): Promise<void> {
  if (!nextPath) return

  // Path yang kini dipakai konten aktif tidak boleh punya redirect.
  await deleteRedirectFrom({ payload, req, tenantID, from: nextPath })

  if (!previousPath || previousPath === nextPath) return

  // A -> lama, sekarang lama -> baru: A diarahkan langsung ke path baru.
  await payload.update({
    collection: 'redirects',
    where: {
      and: [{ tenant: { equals: tenantID } }, { to: { equals: previousPath } }],
    },
    data: { to: nextPath },
    overrideAccess: true,
    req,
  })

  const existing = await payload.find({
    collection: 'redirects',
    where: {
      and: [{ tenant: { equals: tenantID } }, { from: { equals: previousPath } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'redirects',
      id: existing.docs[0].id,
      data: { to: nextPath, automatic: true },
      overrideAccess: true,
      req,
      context: { skipRedirectValidation: true },
    })
    return
  }

  await payload.create({
    collection: 'redirects',
    data: {
      tenant: tenantID,
      from: previousPath,
      to: nextPath,
      statusCode: '301',
      automatic: true,
    } as never,
    overrideAccess: true,
    req,
    context: { skipRedirectValidation: true },
  })
}

/**
 * Versi khusus halaman: path dihitung dari breadcrumb/slug halaman.
 *
 * @param previousDoc kondisi halaman sebelum perubahan (undefined saat create)
 */
export async function syncRedirectForPageChange({
  payload,
  req,
  previousDoc,
  doc,
  tenantID,
}: {
  payload: Payload
  req: PayloadRequest
  previousDoc?: Partial<Page> | null
  doc: Partial<Page>
  tenantID: string
}): Promise<void> {
  await syncRedirectForPathChange({
    payload,
    req,
    tenantID,
    nextPath: extractPagePath(doc),
    previousPath: previousDoc ? extractPagePath(previousDoc as Page) : null,
  })
}
