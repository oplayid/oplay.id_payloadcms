import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'oplay.id - Autonomous Legal Tech Ecosystem',
    short_name: 'oplay.id',
    description: 'Platform website builder multi-tenant dan legal tech ecosystem.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
  }
}
