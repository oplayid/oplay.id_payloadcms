import { Block } from 'payload'

export const appleVideoScrubField: Block = {
  slug: 'AppleVideoScrub',
  labels: { singular: 'Video Scrub', plural: 'Video Scrubs' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul' },
    { name: 'subtitle', type: 'text', label: 'Subjudul' },
    {
      name: 'items',
      type: 'array',
      label: 'Item Video',
      fields: [
        {
          name: 'videoUrl',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Video',
        },
      ],
    },
  ],
}
