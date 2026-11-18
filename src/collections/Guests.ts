import { type CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import {
  authenticated,
  getUserTenantIDs,
  isSuperAdmin,
  tenantContentScope,
} from '@/access'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import {
  buildInvitationLinkSlug,
  generateInvitationCode,
  INVITATION_CODE_LENGTH,
} from '@/lib/invitationLink'
import { guestImportEndpoint } from '@/endpoints/guestsImport'

/**
 * Tamu undangan.
 *
 * Setiap tamu mendapat URL pribadi `/undangan/<nama-tamu>-<kode>`.
 *
 * `linkSlug` dan `invitationCode` dibuat sekali saat dokumen dibuat dan tidak
 * pernah berubah walau nama tamu diedit. Link yang sudah tersebar lewat
 * WhatsApp tidak boleh mati hanya karena salah ketik nama.
 *
 * Data tamu bersifat pribadi (nama, nomor telepon): tidak ada akses publik ke
 * koleksi ini. Halaman undangan mengaksesnya lewat Local API `overrideAccess`.
 */
export const Guests: CollectionConfig = {
  slug: 'guests',
  labels: {
    singular: 'Tamu Undangan',
    plural: 'Tamu Undangan',
  },
  defaultSort: 'name',
  admin: {
    group: 'Undangan',
    useAsTitle: 'name',
    defaultColumns: ['name', 'event', 'rsvpStatus', 'pax', 'disabled', 'tenant'],
    description:
      'Setiap tamu punya link undangan pribadi. Salin link lewat panel "Bagikan Undangan" di sidebar.',
    listSearchableFields: ['name', 'phone', 'email', 'linkSlug', 'invitationCode'],
    components: {
      // Tombol di menu "..." pada daftar tamu.
      listMenuItems: ['@/components/admin/GuestImportAction'],
      // Banner di atas tabel: pintu masuk utama fitur impor.
      beforeListTable: ['@/components/admin/GuestImportBanner'],
      views: {
        importGuests: {
          Component: '@/components/admin/GuestImportView',
          path: '/import',
          exact: true,
        },
      },
    },
  },
  access: {
    // Tidak ada pembacaan publik: hanya user login dari tenant terkait.
    read: tenantContentScope,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  endpoints: [
    {
      path: '/import',
      method: 'post',
      handler: guestImportEndpoint,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req, context }) => {
        if (!data) return data

        const next = { ...(data as Record<string, any>) }
        const original = (originalDoc || {}) as Record<string, any>

        // Link yang sudah dikirim tidak boleh berubah. Kunci nilai lama pada
        // setiap update, termasuk saat admin mengedit nama tamu.
        if (original.linkSlug) {
          next.linkSlug = original.linkSlug
          next.invitationCode = original.invitationCode || next.invitationCode
        } else {
          const importedCode =
            typeof next.invitationCode === 'string' ? next.invitationCode.trim() : ''
          const importedSlug = typeof next.linkSlug === 'string' ? next.linkSlug.trim() : ''

          // Impor massal menyiapkan kode + slug sekaligus untuk satu batch agar
          // tidak melakukan pengecekan tabrakan per baris. Hanya nilai dari
          // endpoint impor (bukan form admin) yang diterima.
          if (context?.fromGuestImport && importedCode && importedSlug) {
            next.invitationCode = importedCode
            next.linkSlug = importedSlug
          } else {
            const name = typeof next.name === 'string' ? next.name : original.name
            const tenantRef = next.tenant ?? original.tenant
            const tenantID =
              tenantRef && typeof tenantRef === 'object'
                ? (tenantRef as { id?: string }).id
                : (tenantRef as string | undefined)

            let code = generateInvitationCode(INVITATION_CODE_LENGTH)
            let linkSlug = buildInvitationLinkSlug(name, code)

            // Tabrakan kode sangat jarang, tapi tetap dicek agar penyimpanan
            // tidak gagal karena unique index [tenant, linkSlug/invitationCode].
            if (tenantID) {
              for (let attempt = 0; attempt < 8; attempt += 1) {
                const clash = await req.payload.find({
                  collection: 'guests',
                  where: {
                    and: [
                      { tenant: { equals: tenantID } },
                      {
                        or: [
                          { linkSlug: { equals: linkSlug } },
                          { invitationCode: { equals: code } },
                        ],
                      },
                    ],
                  },
                  limit: 1,
                  depth: 0,
                  overrideAccess: true,
                  req,
                })

                if (clash.docs.length === 0) break

                code = generateInvitationCode(INVITATION_CODE_LENGTH)
                linkSlug = buildInvitationLinkSlug(name, code)
              }
            }

            next.invitationCode = code
            next.linkSlug = linkSlug
          }
        }

        // Jumlah kursi awal mengikuti default acara bila admin tidak mengisi.
        // Hanya saat create, agar update RSVP tidak menimpa pax tamu.
        if (!original.id && next.pax == null) {
          const eventRef = next.event ?? original.event
          const eventID =
            eventRef && typeof eventRef === 'object'
              ? (eventRef as { id?: string }).id
              : (eventRef as string | undefined)

          if (eventID) {
            try {
              const event = await req.payload.findByID({
                collection: 'events',
                id: eventID,
                depth: 0,
                overrideAccess: true,
                req,
              })
              const defaultPax = (event as { defaultPax?: number | null }).defaultPax
              if (typeof defaultPax === 'number' && defaultPax > 0) {
                next.pax = defaultPax
              }
            } catch {
              // Acara belum tersimpan / tidak ditemukan: biarkan nilai default
              // field yang dipakai.
            }
          }
        }

        return next
      },
    ],
    afterChange: [
      async ({ context }) => {
        // Impor massal melakukan invalidasi sekali per batch di endpoint.
        if (context?.fromGuestImport) return
        await invalidateContent([CACHE_TAGS.invitations])
      },
    ],
    afterDelete: [
      async () => {
        await invalidateContent([CACHE_TAGS.invitations])
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'linkSlug'], unique: true },
    { fields: ['tenant', 'invitationCode'], unique: true },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nama Tamu',
      admin: {
        description:
          'Tampil di halaman undangan. Link tidak berubah bila nama diedit setelah tamu dibuat.',
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
      label: 'Acara',
      filterOptions: ({ req }) => {
        // Tanpa user (Local API / endpoint publik dengan `overrideAccess`) jangan
        // batasi opsi: create/update tetap dijaga `authenticated` di atas.
        if (!req.user) return true
        if (isSuperAdmin(req.user as User | null)) return true
        const ids = getUserTenantIDs(req.user as User | null)
        return ids.length > 0 ? { tenant: { in: ids } } : true
      },
    },
    {
      name: 'salutation',
      type: 'text',
      label: 'Sapaan',
      admin: {
        description: 'Contoh: Bapak, Ibu, Saudara, Keluarga. Boleh dikosongkan.',
        width: '50%',
      },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Kategori Tamu',
      admin: {
        description: 'Contoh: Keluarga, Kantor, Teman. Membantu pengelompokan.',
        width: '50%',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Nomor WhatsApp',
      admin: {
        description: 'Dipakai tombol "Bagikan via WhatsApp". Format 628xxxxxxxxxx.',
        width: '50%',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      admin: { width: '50%' },
    },
    {
      name: 'pax',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 50,
      label: 'Jumlah Kursi / Orang',
      admin: {
        description: 'Batas maksimal tamu yang boleh dikonfirmasi lewat RSVP.',
      },
    },
    {
      name: 'personalNote',
      type: 'textarea',
      label: 'Pesan Pribadi untuk Tamu',
      admin: {
        description: 'Opsional. Tampil di cover undangan bila blok cover mengaktifkannya.',
      },
    },
    {
      name: 'linkSlug',
      type: 'text',
      unique: false,
      index: true,
      label: 'Slug Link Undangan',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Dibuat otomatis dan tidak berubah.',
      },
    },
    {
      name: 'invitationCode',
      type: 'text',
      index: true,
      label: 'Kode Undangan',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Kode pendek untuk QR / check-in. Bisa juga dipakai sebagai alias URL.',
      },
    },
    {
      name: 'invitationShare',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/admin/InvitationShareField',
        },
      },
    },
    {
      name: 'disabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Nonaktifkan link undangan',
      admin: {
        position: 'sidebar',
        description: 'Aktif: tamu melihat 404 dan tidak bisa RSVP.',
      },
    },
    {
      type: 'collapsible',
      label: 'Status RSVP & Kunjungan',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'rsvpStatus',
          type: 'select',
          defaultValue: 'pending',
          label: 'Status Kehadiran',
          options: [
            { label: 'Belum konfirmasi', value: 'pending' },
            { label: 'Hadir', value: 'attending' },
            { label: 'Tidak hadir', value: 'not_attending' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'rsvpPax',
          type: 'number',
          min: 0,
          max: 50,
          label: 'Jumlah yang Hadir',
          admin: { width: '50%' },
        },
        {
          name: 'rsvpMessage',
          type: 'textarea',
          label: 'Ucapan / Pesan RSVP',
        },
        {
          name: 'rsvpAt',
          type: 'date',
          label: 'Waktu Konfirmasi',
          admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' },
        },
        {
          name: 'checkedInAt',
          type: 'date',
          label: 'Waktu Check-in',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            width: '50%',
            description: 'Diisi saat tamu check-in di lokasi acara.',
          },
        },
        {
          name: 'sentAt',
          type: 'date',
          label: 'Terakhir Dikirim',
          admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' },
        },
        {
          name: 'lastViewedAt',
          type: 'date',
          label: 'Terakhir Dilihat',
          admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' },
        },
        {
          name: 'viewCount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          label: 'Jumlah Kunjungan',
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
