// apps/core-portal/lib/getTheme.ts
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CACHE_TAGS, cacheQuery } from './contentCache'

type ThemeData = Record<string, any>

const FALLBACK_THEME: ThemeData = {
  themeName: 'Default Fallback',
  colors: {
    bg: '#ffffff',
    surface: '#f8f9fa',
    text: '#0f172a',
    primary: '#0f172a',
  },
  fonts: {
    heading: '"Syne", sans-serif',
    body: '"Inter", sans-serif',
  },
  effects: {
    'radius-box': '1rem',
    'radius-btn': '0.75rem',
    shadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
  },
}

/** Query mentah; melempar error agar kegagalan DB tidak ikut ter-cache. */
async function queryThemeData(preset: string): Promise<ThemeData | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'themes',
    where: {
      or: [{ slug: { equals: preset } }, { id: { equals: preset } }],
    },
    limit: 1,
  })

  const themeDoc = result.docs[0] as { themeData?: ThemeData | null } | undefined
  return themeDoc?.themeData || null
}

const cachedThemeData = cacheQuery(
  // Tema jarang berubah; TTL panjang sebagai pengaman.
  { key: 'theme-data', tags: [CACHE_TAGS.themes], revalidate: 3600 },
  queryThemeData,
)

/**
 * Data tema untuk satu preset.
 *
 * Dua lapis cache: `cache()` mendedupe dalam satu request (mis. generateMetadata
 * + render halaman), `cacheQuery` menyimpannya lintas request sampai tag
 * `themes` diinvalidasi.
 */
export const getThemeData = cache(async function getThemeData(
  preset: string = 'default-theme',
): Promise<ThemeData> {
  try {
    const themeData = await cachedThemeData(preset)
    if (themeData) return themeData
  } catch (err) {
    console.error(`Gagal mengambil tema "${preset}" dari Payload CMS:`, err)
  }

  return FALLBACK_THEME
})
