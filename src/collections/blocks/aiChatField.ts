import { Block } from 'payload'

export const aiChatField: Block = {
  slug: 'AIChatWidget',
  labels: { singular: 'AI Chat', plural: 'AI Chats' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Judul' },
    { name: 'aiModel', type: 'text', label: 'Nama Model AI' },
    { name: 'placeholder', type: 'text', label: 'Placeholder Input' },
  ],
}
