import { Block } from 'payload'

export const documentFlipField: Block = {
  slug: 'DocumentFlip',
  labels: { singular: 'Document Flip', plural: 'Document Flips' },
  fields: [
    { name: 'frontContent', type: 'richText', label: 'Konten Depan' },
    { name: 'backContent', type: 'richText', label: 'Konten Belakang' },
  ],
}
