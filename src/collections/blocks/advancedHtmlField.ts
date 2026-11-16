import type { Block } from 'payload'

/**
 * Blok kebebasan penuh untuk superadmin.
 *
 * Menyimpan HTML/CSS/JS mentah dan merendernya apa adanya. Karena bisa
 * mengeksekusi kode, Pages.beforeValidate menolak blok ini untuk non-superadmin.
 */
export const advancedHtmlField: Block = {
  slug: 'AdvancedHTML',
  labels: {
    singular: 'Advanced HTML (superadmin)',
    plural: 'Advanced HTML (superadmin)',
  },
  fields: [
    {
      name: 'html',
      type: 'code',
      label: 'HTML',
      required: true,
      admin: {
        language: 'html',
        description: 'Markup mentah. Ditempel apa adanya ke dalam halaman.',
      },
    },
    {
      name: 'css',
      type: 'code',
      label: 'CSS (opsional)',
      admin: {
        language: 'css',
        description: 'Disisipkan sebagai tag <style> di halaman ini saja.',
      },
    },
    {
      name: 'js',
      type: 'code',
      label: 'JavaScript (opsional)',
      admin: {
        language: 'javascript',
        description: 'Dijalankan setelah halaman dimuat. Gunakan dengan hati-hati.',
      },
    },
  ],
}
