import { Block } from 'payload'

export const bioProfileField: Block = {
  slug: 'BioProfile',
  labels: { singular: 'Bio Profile', plural: 'Bio Profiles' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'bio-card-minimal',
      label: 'Varian Tampilan',
      options: [
        { label: 'Minimal Card', value: 'bio-card-minimal' },
        { label: 'CV Modern', value: 'cv-modern-resume' },
      ],
    },
    {
      name: 'avatarUrl',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto Avatar',
    },
    { name: 'name', type: 'text', required: true, label: 'Nama' },
    { name: 'title', type: 'text', required: true, label: 'Gelar/Title' },
    { name: 'bio', type: 'textarea', required: true, label: 'Biografi' },
    { name: 'location', type: 'text', label: 'Lokasi' },
    { name: 'badge', type: 'text', label: 'Badge' },
    {
      name: 'links',
      type: 'array',
      label: 'Tautan Sosial',
      fields: [
        { name: 'platform', type: 'text', required: true, label: 'Platform' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
        { name: 'description', type: 'text', label: 'Deskripsi' },
      ],
    },
    {
      name: 'experiences',
      type: 'array',
      label: 'Pengalaman',
      fields: [
        { name: 'role', type: 'text', required: true, label: 'Peran' },
        { name: 'company', type: 'text', required: true, label: 'Perusahaan' },
        { name: 'period', type: 'text', required: true, label: 'Periode' },
        { name: 'category', type: 'select', options: ['work', 'organization', 'education', 'project'], label: 'Kategori' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
        {
          name: 'achievements',
          type: 'text',
          hasMany: true,
          label: 'Pencapaian',
        },
        {
          name: 'skills',
          type: 'text',
          hasMany: true,
          label: 'Skill',
        },
      ],
    },
  ],
}
