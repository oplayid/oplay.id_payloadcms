// apps/core-portal/lib/getTheme.ts
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

export const getThemeData = cache(async function getThemeData(preset: string = 'default-theme') {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'themes',
      where: {
        or: [{ slug: { equals: preset } }, { id: { equals: preset } }],
      },
      limit: 1,
    })

    if (result.docs.length > 0) {
      const themeDoc: any = result.docs[0]
      if (themeDoc.themeData) {
        return themeDoc.themeData
      }
    }
  } catch (err) {
    console.error(`Gagal mengambil tema "${preset}" dari Payload CMS:`, err)
  }

  // Fallback darurat jika belum ada data di database
  return {
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
})
