import { Block } from 'payload'

export const notificationBannerField: Block = {
  slug: 'NotificationBanner',
  labels: { singular: 'Notification Banner', plural: 'Notification Banners' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'banner-top-alert',
      label: 'Varian Tampilan',
      options: [
        { label: 'Top Alert', value: 'banner-top-alert' },
        { label: 'Floating Pill', value: 'banner-floating-pill' },
        { label: 'With Icon', value: 'banner-with-icon' },
        { label: 'Action Right', value: 'banner-action-right' },
        { label: 'Minimal Line', value: 'banner-minimal-line' },
      ],
    },
    { name: 'badgeText', type: 'text', label: 'Teks Badge' },
    { name: 'message', type: 'text', required: true, label: 'Pesan' },
    {
      name: 'action',
      type: 'group',
      label: 'Aksi',
      fields: [
        { name: 'label', type: 'text', label: 'Label Tombol' },
        { name: 'href', type: 'text', label: 'Link Tombol' },
      ],
    },
  ],
}
