import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/**
 * Host R2 publik dibaca saat build. Bila R2_PUBLIC_URL produksi berbeda dari
 * default, berikan nilai yang sama sebagai build-arg (lihat Dockerfile dan
 * .github/workflows/docker.yml). Tanpa ini, next/image menolak hostname R2
 * tersebut dan halaman dengan HeroBanner bisa error 500.
 */
function r2PublicHostname(): string {
  const raw = process.env.R2_PUBLIC_URL || 'https://storage.assets.oplay.id'
  try {
    return new URL(raw).hostname || 'storage.assets.oplay.id'
  } catch {
    return 'storage.assets.oplay.id'
  }
}

const nextConfig: NextConfig = {
  experimental: {
    // Menandai upgrade keamanan Next.js yang sudah diterapkan (16.4.1 → 16.4.6).
    agentUpgrade: 'security',
  },
  // Dibutuhkan oleh Dockerfile (Coolify) yang memakai .next/standalone.
  output: 'standalone',
  allowedDevOrigins: ['umkm.oplay.id'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: r2PublicHostname(),
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Header dasar. HSTS/TLS ditangani reverse proxy Coolify. CSP sengaja tidak
  // dipaksa di sini karena halaman mendukung blok AdvancedHTML dan iframe peta.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
