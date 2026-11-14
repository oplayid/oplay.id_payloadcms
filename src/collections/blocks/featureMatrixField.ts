import { Block } from 'payload'

export const featureMatrixField: Block = {
  slug: 'FeatureMatrix',
  labels: { singular: 'Feature Matrix', plural: 'Feature Matrices' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'matrix-standard',
      label: 'Varian Tampilan',
      options: [
        { label: 'Matrix Standard', value: 'matrix-standard' },
        { label: 'Highlight Middle', value: 'matrix-highlight-middle' },
        { label: 'Side Cards', value: 'matrix-side-cards' },
        { label: 'Terminal Style', value: 'matrix-terminal-style' },
        { label: 'Minimal Clean', value: 'matrix-minimal-clean' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'planNames',
      type: 'text',
      hasMany: true,
      required: true,
      label: 'Nama Paket (satu per baris)',
      admin: { description: 'Urutan nama paket menentukan urutan kolom matriks.' },
    },
    {
      name: 'features',
      type: 'array',
      label: 'Daftar Fitur',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nama Fitur' },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
        {
          name: 'tiers',
          type: 'array',
          label: 'Nilai per Paket',
          admin: {
            description:
              'Urutkan sesuai urutan Nama Paket. Centang "Termasuk" atau isi label khusus (mis. "5 GB").',
          },
          fields: [
            { name: 'included', type: 'checkbox', defaultValue: false, label: 'Termasuk' },
            { name: 'label', type: 'text', label: 'Label Khusus (opsional)' },
          ],
        },
      ],
    },
  ],
}
