import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_FILE = /\.(?:avif|css|eot|gif|ico|jpeg|jpg|js|json|map|mjs|otf|png|svg|ttf|txt|webmanifest|webp|woff|woff2|xml)$/i

/**
 * Locale routing ringan (tanpa akses database).
 *
 * - `/id/...` -> redirect permanen ke `/...` (default locale tanpa prefix)
 * - Menyimpan locale aktif di header `x-locale` untuk root layout
 *
 * Resolusi tenant/domain dilakukan di server components (pageBuilder),
 * bukan di proxy, agar tidak ada query database di edge/middleware.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/preview') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const parts = pathname.split('/').filter(Boolean)

  if (parts[0] === 'id') {
    const url = req.nextUrl.clone()
    url.pathname = `/${parts.slice(1).join('/')}` || '/'
    return NextResponse.redirect(url, 308)
  }

  const headers = new Headers(req.headers)
  headers.set('x-locale', parts[0] === 'en' ? 'en' : 'id')

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|admin|api|preview).*)'],
}
