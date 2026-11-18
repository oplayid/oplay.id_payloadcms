/**
 * Tag cache konten (modul murni, aman diimpor client/server).
 * Setiap perubahan dokumen di Payload memanggil `invalidateContent`
 * dengan tag yang sesuai agar pengunjung langsung melihat versi terbaru.
 */
export const CACHE_TAGS = {
  tenants: 'tenants',
  pages: 'pages',
  redirects: 'redirects',
  themes: 'themes',
  /**
   * Konten yang punya URL sendiri (artikel, dan koleksi lain yang didaftarkan
   * di `lib/routableCollections`). Tag dipakai untuk cache detail + listing.
   */
  posts: 'posts',
  /** Acara undangan (judul, tanggal, lokasi, halaman desain). */
  events: 'events',
  /** Tamu undangan + status RSVP. */
  invitations: 'invitations',
} as const
