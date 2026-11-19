import { NextResponse } from 'next/server'

/**
 * Liveness probe untuk Docker HEALTHCHECK / Coolify.
 *
 * Sengaja tidak menyentuh database: pemeriksaan DB membuat health check gagal
 * saat MongoDB sedang restart dan menyebabkan container di-restart berulang.
 * Endpoint ini juga dipakai load balancer untuk mengetahui proses Next sudah
 * siap menerima request.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      version: process.env.APP_VERSION || '1.0.0',
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
