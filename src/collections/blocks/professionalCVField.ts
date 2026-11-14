import { Block } from 'payload'

export const professionalCVField: Block = {
  slug: 'ProfessionalCV',
  labels: { singular: 'Professional CV', plural: 'Professional CVs' },
  fields: [
    { name: 'badge', type: 'text', label: 'Badge' },
    { name: 'name', type: 'text', required: true, label: 'Nama' },
    { name: 'title', type: 'text', required: true, label: 'Gelar/Title' },
    {
      name: 'contact',
      type: 'group',
      label: 'Kontak',
      fields: [
        { name: 'phone', type: 'text', label: 'Telepon' },
        { name: 'email', type: 'text', label: 'Email' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn' },
        { name: 'location', type: 'text', label: 'Lokasi' },
      ],
    },
    { name: 'summary', type: 'textarea', required: true, label: 'Ringkasan' },
    {
      name: 'experiences',
      type: 'array',
      label: 'Pengalaman',
      fields: [
        { name: 'role', type: 'text', required: true, label: 'Peran' },
        { name: 'company', type: 'text', required: true, label: 'Perusahaan' },
        { name: 'period', type: 'text', required: true, label: 'Periode' },
        { name: 'location', type: 'text', label: 'Lokasi' },
        {
          name: 'description',
          type: 'text',
          hasMany: true,
          label: 'Deskripsi',
        },
      ],
    },
    {
      name: 'skills',
      type: 'group',
      label: 'Keahlian',
      fields: [
        { name: 'personal', type: 'text', hasMany: true, label: 'Personal' },
        { name: 'computation', type: 'text', hasMany: true, label: 'Komputasi' },
        { name: 'technical', type: 'text', hasMany: true, label: 'Teknis' },
        { name: 'certifications', type: 'text', hasMany: true, label: 'Sertifikasi' },
      ],
    },
  ],
}
