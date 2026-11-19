import { Block } from 'payload'

/**
 * Section peta/lokasi generik untuk halaman Pages.
 *
 * Sengaja TIDAK memakai API peta / iframe pihak ketiga. Blok ini merender
 * representasi peta bergaris kordinat memakai CSS + data teks (nama lokasi,
 * alamat, latitude, longitude), sehingga tetap tampil tanpa koneksi eksternal,
 * tanpa kunci API, dan tanpa risiko menyuntik HTML pihak ketiga.
 */
export const locationMapField: Block = {
  slug: 'LocationMap',
  labels: {
    singular: 'Peta Lokasi',
    plural: 'Peta Lokasi',
  },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'map-card',
      label: 'Varian Tampilan',
      options: [
        { label: 'Kartu peta + kordinat', value: 'map-card' },
        { label: 'Garis kordinat', value: 'map-coordinate' },
        { label: 'Minimal', value: 'map-minimal' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Lokasi',
      label: 'Judul Seksi',
    },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'locationName',
      type: 'text',
      label: 'Nama Lokasi',
      admin: { description: 'Contoh: Gedung Serbaguna Bintaro, Kantor Pusat.' },
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Alamat / Petunjuk Singkat',
    },
    {
      name: 'latitude',
      type: 'number',
      label: 'Latitude',
      admin: { description: 'Contoh: -6.2088. Boleh dikosongkan.' },
    },
    {
      name: 'longitude',
      type: 'number',
      label: 'Longitude',
      admin: { description: 'Contoh: 106.8456. Boleh dikosongkan.' },
    },
    {
      name: 'showCoordinates',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan angka kordinat',
    },
    {
      name: 'showGrid',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan garis kordinat / grid',
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'h-80',
      label: 'Tinggi Peta',
      options: [
        { label: 'Sedang', value: 'h-64' },
        { label: 'Tinggi', value: 'h-80' },
        { label: 'Sangat tinggi', value: 'h-96' },
      ],
    },
    {
      name: 'embedMode',
      type: 'select',
      defaultValue: 'none',
      label: 'Peta dalam iframe',
      options: [
        { label: 'Tidak ada (gambar kordinat saja)', value: 'none' },
        { label: 'Otomatis dari nama/alamat/kordinat', value: 'auto' },
        { label: 'URL embed kustom', value: 'custom' },
      ],
      admin: {
        description:
          'Mode auto memakai URL embed Google Maps/OpenStreetMap tanpa API key. Mode custom menerima URL dari menu Share → Embed milik penyedia peta.',
      },
    },
    {
      name: 'embedProvider',
      type: 'select',
      defaultValue: 'google',
      label: 'Penyedia iframe otomatis',
      options: [
        { label: 'Google Maps', value: 'google' },
        { label: 'OpenStreetMap', value: 'osm' },
      ],
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as { embedMode?: string } | undefined)?.embedMode === 'auto',
      },
    },
    {
      name: 'zoom',
      type: 'number',
      defaultValue: 15,
      min: 1,
      max: 20,
      label: 'Zoom Awal (1–20)',
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as { embedMode?: string } | undefined)?.embedMode === 'auto',
      },
    },
    {
      name: 'customEmbedUrl',
      type: 'text',
      label: 'URL iframe kustom (https)',
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as { embedMode?: string } | undefined)?.embedMode === 'custom',
        description:
          'Hanya host peta yang diizinkan. Tambahkan host lain lewat ALLOWED_MAP_EMBED_HOSTS di .env.',
      },
    },
    {
      name: 'mapsUrl',
      type: 'text',
      label: 'Tautan peta eksternal (opsional)',
      admin: {
        description:
          'Bila diisi, tombol pulang ke penyedia peta ditampilkan. Blok ini tetap tidak memanggil API atau memuat peta dari luar.',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      defaultValue: 'Buka di Maps',
      label: 'Label Tombol',
    },
    { name: 'note', type: 'textarea', label: 'Catatan Tambahan' },
  ],
}
