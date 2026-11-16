import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Seed template situs bawaan.
 *
 * Idempotent: template dengan slug yang sama akan diperbarui, bukan diduplikasi.
 * Jalankan dengan `pnpm seed:templates`.
 *
 * Catatan: halaman template memakai slug, bukan ID. Tautan navbar/footer
 * memakai `pageSlug` yang otomatis diubah menjadi relasi halaman milik tenant
 * saat template diterapkan (`src/lib/applyTemplate.ts`).
 */

type TemplateSeed = {
  name: string
  slug: string
  category: 'business' | 'umkm' | 'portfolio' | 'legal' | 'event' | 'other'
  description: string
  defaultLayoutMode: 'inherit' | 'canvas' | 'bare'
  navigation: Record<string, unknown>
  footer: Record<string, unknown>
  pages: Array<Record<string, unknown>>
}

const companyProfile: TemplateSeed = {
  name: 'Company Profile',
  slug: 'company-profile',
  category: 'business',
  description:
    'Beranda, profil perusahaan, layanan, dan kontak. Cocok untuk company profile, konsultan, agensi, dan jasa profesional.',
  defaultLayoutMode: 'inherit',
  navigation: {
    enabled: true,
    style: 'navbar-standard',
    categories: [
      { label: 'Beranda', pageSlug: 'home' },
      { label: 'Tentang Kami', pageSlug: 'tentang-kami' },
      { label: 'Layanan', pageSlug: 'layanan' },
      { label: 'Kontak', pageSlug: 'kontak' },
    ],
    languages: [
      { code: 'id', label: 'ID', name: 'Bahasa Indonesia', flag: '🇮🇩' },
      { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
    ],
  },
  footer: {
    enabled: true,
    style: 'footer-standard',
    tagline: 'Mitra terpercaya untuk kebutuhan bisnis Anda.',
    columns: [
      {
        title: 'Perusahaan',
        links: [
          { label: 'Tentang Kami', pageSlug: 'tentang-kami' },
          { label: 'Layanan', pageSlug: 'layanan' },
          { label: 'Kontak', pageSlug: 'kontak' },
        ],
      },
      {
        title: 'Bantuan',
        links: [
          { label: 'Pertanyaan Umum', href: '/#faq' },
          { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
        ],
      },
    ],
  },
  pages: [
    {
      title: 'Beranda',
      slug: 'home',
      blocks: [
        {
          blockType: 'HeroBanner',
          variant: 'hero-standard',
          badge: 'Dipercaya sejak 2015',
          title: 'Solusi bisnis yang tumbuh bersama Anda',
          subtitle:
            'Kami membantu perusahaan merancang, membangun, dan mengembangkan layanan yang benar-benar dipakai pelanggan.',
          align: 'center',
          cta: { label: 'Konsultasi Gratis', href: '/kontak' },
          secondaryCta: { label: 'Lihat Layanan', href: '/layanan' },
        },
        {
          blockType: 'FeatureSteps',
          sectionBadge: 'Cara Kerja',
          sectionTitle: 'Tiga langkah menuju hasil yang terukur',
          steps: [
            {
              number: '01',
              title: 'Diskusi kebutuhan',
              description:
                'Kami memetakan tujuan, kendala, dan target bisnis Anda sebelum menyusun rencana.',
            },
            {
              number: '02',
              title: 'Rancang & bangun',
              description:
                'Tim kami mengerjakan solusi secara bertahap dengan demo dan revisi di setiap fase.',
            },
            {
              number: '03',
              title: 'Pendampingan',
              description:
                'Setelah rilis, kami memantau performa dan membantu tim Anda mengembangkan hasilnya.',
            },
          ],
        },
        {
          blockType: 'FAQHub',
          sectionBadge: 'FAQ',
          sectionTitle: 'Pertanyaan yang sering diajukan',
          sectionSubtitle: 'Belum menemukan jawabannya? Hubungi kami lewat halaman kontak.',
          variant: 'list',
          faqs: [
            {
              question: 'Berapa lama proses pengerjaan?',
              answer:
                'Bergantung kompleksitas. Proyek skala kecil biasanya 1–2 minggu, sedangkan sistem custom 4–8 minggu.',
              category: 'Proses',
            },
            {
              question: 'Apakah bisa menyesuaikan anggaran?',
              answer:
                'Bisa. Kami menyusun lingkup pekerjaan bertahap agar sesuai prioritas dan anggaran Anda.',
              category: 'Biaya',
            },
            {
              question: 'Apakah ada dukungan setelah proyek selesai?',
              answer:
                'Ya. Tersedia paket pendampingan bulanan untuk pemeliharaan, pembaruan, dan pengembangan lanjutan.',
              category: 'Dukungan',
            },
          ],
        },
        {
          blockType: 'EnterpriseCallout',
          badge: 'Mulai Sekarang',
          title: 'Siap membawa bisnis Anda ke tahap berikutnya?',
          description:
            'Ceritakan kebutuhan Anda. Kami akan mengirimkan ringkasan pendekatan dan estimasi dalam 1×24 jam kerja.',
          primaryCta: { label: 'Hubungi Kami', href: '/kontak' },
          secondaryCta: { label: 'Lihat Layanan', href: '/layanan' },
        },
      ],
    },
    {
      title: 'Tentang Kami',
      slug: 'tentang-kami',
      blocks: [
        {
          blockType: 'HeroBanner',
          variant: 'hero-minimal-bottom-left',
          badge: 'Tentang Kami',
          title: 'Tim kecil, komitmen besar',
          subtitle:
            'Kami adalah tim lintas disiplin yang percaya bahwa pekerjaan terbaik lahir dari pemahaman mendalam atas masalah klien.',
          align: 'left',
        },
        {
          blockType: 'ContentSection',
          badge: 'Cerita Kami',
          title: 'Berawal dari satu proyek kecil',
          description:
            'Sejak 2015 kami mendampingi puluhan organisasi membangun layanan digitalnya. Prinsip kami sederhana: pahami masalah, kerjakan dengan rapi, lalu ukur hasilnya bersama.',
          layout: 'stacked',
          cta: { label: 'Lihat Layanan Kami', href: '/layanan' },
        },
        {
          blockType: 'TrustCompliance',
          sectionBadge: 'Nilai Kami',
          sectionTitle: 'Cara kami bekerja',
          sectionSubtitle: 'Tiga prinsip yang kami pegang di setiap proyek.',
          items: [
            {
              title: 'Transparan',
              description:
                'Anda selalu tahu status pekerjaan, keputusan teknis, dan alokasi biaya.',
              code: 'TRANSPARAN',
            },
            {
              title: 'Tepat waktu',
              description: 'Tenggat disepakati di awal dan dipantau bersama setiap pekan.',
              code: 'TEPAT WAKTU',
            },
            {
              title: 'Terukur',
              description: 'Keberhasilan dinilai dari hasil, bukan sekadar daftar fitur.',
              code: 'TERUKUR',
            },
          ],
        },
      ],
    },
    {
      title: 'Layanan',
      slug: 'layanan',
      blocks: [
        {
          blockType: 'HeroBanner',
          variant: 'hero-split-bento',
          badge: 'Layanan',
          title: 'Layanan yang bisa disesuaikan dengan kebutuhan Anda',
          subtitle: 'Pilih satu layanan, atau gabungkan beberapa sesuai prioritas bisnis.',
          align: 'left',
        },
        {
          blockType: 'FeatureSteps',
          sectionBadge: 'Lingkup',
          sectionTitle: 'Satu alur, tiga layanan inti',
          steps: [
            {
              number: '01',
              title: 'Strategi & riset',
              description:
                'Riset pengguna, pemetaan proses bisnis, dan penyusunan peta jalan produk.',
            },
            {
              number: '02',
              title: 'Desain & pengembangan',
              description:
                'Desain antarmuka, pembangunan sistem, hingga pengujian sebelum rilis.',
            },
            {
              number: '03',
              title: 'Pertumbuhan',
              description: 'Optimasi performa, analitik, dan pengembangan fitur lanjutan.',
            },
          ],
        },
        {
          blockType: 'FAQHub',
          sectionBadge: 'FAQ Layanan',
          sectionTitle: 'Pertanyaan seputar layanan',
          variant: 'list',
          faqs: [
            {
              question: 'Apakah layanan bisa dipakai terpisah?',
              answer:
                'Bisa. Setiap layanan dapat diambil sendiri, tetapi hasil terbaik biasanya datang saat digabungkan.',
              category: 'Layanan',
            },
            {
              question: 'Siapa yang akan mengerjakan proyek saya?',
              answer:
                'Tim yang sama mulai dari diskusi awal hingga serah terima, sehingga konteks tidak hilang.',
              category: 'Tim',
            },
          ],
        },
      ],
    },
    {
      title: 'Kontak',
      slug: 'kontak',
      blocks: [
        {
          blockType: 'HeroBanner',
          variant: 'hero-standard',
          badge: 'Kontak',
          title: 'Mari bicarakan kebutuhan Anda',
          subtitle: 'Kirim pesan singkat, kami balas dalam 1×24 jam kerja.',
          align: 'center',
        },
        {
          blockType: 'ContentSection',
          badge: 'Hubungi Kami',
          title: 'Kami siap membantu',
          description:
            'Sampaikan tujuan, kendala, dan tenggat Anda. Kami akan mengusulkan pendekatan yang paling sesuai beserta estimasinya.',
          layout: 'stacked',
          cta: { label: 'Email: halo@perusahaan.id', href: 'mailto:halo@perusahaan.id' },
        },
      ],
    },
  ],
}

const umkmToko: TemplateSeed = {
  name: 'UMKM Toko Online',
  slug: 'umkm-toko-online',
  category: 'umkm',
  description:
    'Halaman promosi untuk toko dan UMKM: sorotan produk, cara pesan, dan pertanyaan umum. Siapkan tautan WhatsApp Anda.',
  defaultLayoutMode: 'inherit',
  navigation: {
    enabled: true,
    style: 'navbar-floating-island',
    brandName: '',
    categories: [
      { label: 'Beranda', pageSlug: 'home' },
      { label: 'Produk', pageSlug: 'produk' },
      { label: 'Cara Pesan', pageSlug: 'cara-pesan' },
      { label: 'Kontak', pageSlug: 'kontak' },
    ],
  },
  footer: {
    enabled: true,
    style: 'footer-minimal-center',
    tagline: 'Pesan mudah lewat WhatsApp, dikirim dari kota kami.',
    columns: [
      {
        title: 'Toko',
        links: [
          { label: 'Produk', pageSlug: 'produk' },
          { label: 'Cara Pesan', pageSlug: 'cara-pesan' },
          { label: 'Kontak', pageSlug: 'kontak' },
        ],
      },
    ],
  },
  pages: [
    {
      title: 'Beranda',
      slug: 'home',
      blocks: [
        {
          blockType: 'HeroBanner',
          variant: 'hero-casual-elegant',
          badge: 'Buatan Lokal',
          title: 'Produk rumahan, kualitas toko besar',
          subtitle:
            'Dibuat harian dalam batch kecil. Pesan lewat WhatsApp, kami siapkan, lalu kirim hari itu juga.',
          align: 'center',
          cta: { label: 'Pesan Sekarang', href: '/cara-pesan' },
          secondaryCta: { label: 'Lihat Produk', href: '/produk' },
        },
        {
          blockType: 'FeatureSteps',
          sectionBadge: 'Cara Pesan',
          sectionTitle: 'Pesan dalam tiga langkah',
          steps: [
            {
              number: '01',
              title: 'Pilih produk',
              description: 'Lihat daftar produk dan tentukan jumlahnya.',
            },
            {
              number: '02',
              title: 'Chat WhatsApp',
              description: 'Kirim pesanan lewat WhatsApp untuk konfirmasi stok dan ongkir.',
            },
            {
              number: '03',
              title: 'Terima di rumah',
              description: 'Bayar setelah konfirmasi. Pesanan dikirim hari yang sama.',
            },
          ],
        },
        {
          blockType: 'FAQHub',
          sectionBadge: 'FAQ',
          sectionTitle: 'Pertanyaan pembeli',
          variant: 'bento',
          faqs: [
            {
              question: 'Apakah bisa kirim luar kota?',
              answer: 'Bisa. Ongkir dihitung dari kota asal sesuai ekspedisi pilihan Anda.',
              category: 'Pengiriman',
            },
            {
              question: 'Bagaimana cara membayar?',
              answer: 'Transfer bank atau e-wallet setelah pesanan dikonfirmasi lewat WhatsApp.',
              category: 'Pembayaran',
            },
            {
              question: 'Apakah menerima pesanan besar?',
              answer: 'Menerima. Beri tahu minimal H-2 agar kami siapkan stok tambahan.',
              category: 'Pesanan',
            },
          ],
        },
        {
          blockType: 'EnterpriseCallout',
          badge: 'Hubungi Kami',
          title: 'Butuh pesanan dalam jumlah banyak?',
          description: 'Kami melayani pesanan hampers, kantor, dan acara dengan harga khusus.',
          primaryCta: { label: 'Chat WhatsApp', href: 'https://wa.me/628000000000' },
        },
      ],
    },
    {
      title: 'Produk',
      slug: 'produk',
      blocks: [
        {
          blockType: 'HeroBanner',
          variant: 'hero-split-bento',
          badge: 'Katalog',
          title: 'Pilihan produk favorit',
          subtitle: 'Ganti teks dan foto dengan produk Anda sendiri lewat panel admin.',
          align: 'left',
        },
        {
          blockType: 'FeatureSteps',
          sectionBadge: 'Kategori',
          sectionTitle: 'Tiga kategori utama',
          steps: [
            {
              number: '01',
              title: 'Reguler',
              description: 'Produk harian dengan harga terjangkau.',
            },
            {
              number: '02',
              title: 'Premium',
              description: 'Bahan pilihan untuk hadiah dan acara khusus.',
            },
            {
              number: '03',
              title: 'Paket hemat',
              description: 'Kombinasi beberapa produk dengan harga lebih baik.',
            },
          ],
        },
      ],
    },
    {
      title: 'Cara Pesan',
      slug: 'cara-pesan',
      blocks: [
        {
          blockType: 'ContentSection',
          badge: 'Pemesanan',
          title: 'Pesan lewat WhatsApp',
          description:
            'Kirim nama produk, jumlah, dan alamat pengiriman. Kami balas dengan total harga dan ketersediaan stok.',
          layout: 'stacked',
          cta: { label: 'Chat WhatsApp', href: 'https://wa.me/628000000000' },
        },
        {
          blockType: 'FAQHub',
          sectionBadge: 'FAQ',
          sectionTitle: 'Sering ditanyakan',
          variant: 'list',
          faqs: [
            {
              question: 'Berapa lama pesanan diproses?',
              answer: 'Pesanan sebelum jam 15.00 dikirim hari yang sama.',
              category: 'Pengiriman',
            },
            {
              question: 'Bisa COD?',
              answer: 'Bisa untuk area kota, dengan konfirmasi lewat WhatsApp.',
              category: 'Pembayaran',
            },
          ],
        },
      ],
    },
    {
      title: 'Kontak',
      slug: 'kontak',
      blocks: [
        {
          blockType: 'ContentSection',
          badge: 'Kontak',
          title: 'Hubungi toko kami',
          description:
            'WhatsApp: 0800-0000-0000 · Jam buka: 08.00–20.00 · Alamat: sesuaikan dengan lokasi toko Anda.',
          layout: 'stacked',
          cta: { label: 'Chat WhatsApp', href: 'https://wa.me/628000000000' },
        },
      ],
    },
  ],
}

const seeds: TemplateSeed[] = [companyProfile, umkmToko]

const payload = await getPayload({ config })

for (const seed of seeds) {
  const existing = await payload.find({
    collection: 'templates',
    where: { slug: { equals: seed.slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const data = { ...seed } as never

  if (existing.docs[0]) {
    await payload.update({
      collection: 'templates',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
    payload.logger.info(`Template "${seed.slug}" diperbarui.`)
  } else {
    await payload.create({ collection: 'templates', data, overrideAccess: true })
    payload.logger.info(`Template "${seed.slug}" dibuat.`)
  }
}

payload.logger.info('Seed template selesai.')
process.exit(0)
