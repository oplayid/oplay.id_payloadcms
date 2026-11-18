import CanvasRenderer from '@/components/CanvasRenderer'
import { getComponentRegistryMap } from '@/components/componentRegistry'
import type { InvitationContentData } from '@/lib/invitations'
import InvitationExperience from './InvitationExperience'
import InvitationViewTracker from './InvitationViewTracker'

/**
 * Susunan cadangan bila acara belum memilih halaman desain (`invitationPage`).
 *
 * Tetap dirender lewat CanvasRenderer supaya tema, tipografi, dan spacing
 * mengikuti tema tenant yang sama dengan halaman biasa.
 */
const FALLBACK_BLOCKS = [
  {
    blockType: 'InvitationCover',
    variant: 'cover-photo',
    eyebrow: 'Undangan',
    showEventTitle: true,
    showDate: true,
    showGuestName: true,
    guestLabel: 'Kepada Yth.',
    showPax: true,
    showPersonalNote: true,
    personalNoteLabel: 'Pesan untuk Anda',
    showCountdown: true,
    countdownLabel: 'Menuju hari bahagia',
    openButtonLabel: 'Buka Undangan',
  },
  {
    blockType: 'EventHero',
    variant: 'hero-arch',
    eyebrow: 'Kami mengundang Anda',
    showDate: true,
    showVenue: true,
    showOpeningMessage: true,
  },
  {
    blockType: 'EventDetails',
    variant: 'details-cards',
    sectionTitle: 'Detail Acara',
    showDate: true,
    showTime: true,
    showVenue: true,
    showMaps: true,
    mapsButtonLabel: 'Buka di Google Maps',
    showDressCode: true,
    showHost: true,
    showRundown: true,
    rundownTitle: 'Susunan Acara',
  },
  {
    blockType: 'RsvpForm',
    variant: 'rsvp-card',
    sectionTitle: 'Konfirmasi Kehadiran',
    submitLabel: 'Kirim Konfirmasi',
    successMessage: 'Terima kasih! Konfirmasi Anda sudah kami terima.',
    closedMessage: 'Konfirmasi kehadiran sudah ditutup.',
    showPax: true,
    showMessage: true,
    messageLabel: 'Ucapan & doa',
  },
  {
    blockType: 'GiftInfo',
    variant: 'gift-cards',
    sectionTitle: 'Hadiah & Angpao',
    sectionSubtitle:
      'Doa restu Anda adalah hadiah terbaik. Bila ingin memberi tanda kasih, berikut informasinya.',
    showAccounts: true,
    copyLabel: 'Salin nomor',
    showGiftAddress: true,
  },
]

const COVER_TYPE = 'InvitationCover'

function blockType(block: { blockType?: string; type?: string } | null | undefined): string {
  return block?.blockType || block?.type || ''
}

export default function InvitationDetail({ data }: { data: InvitationContentData }) {
  const blocks = data.canvasBlocks.length > 0 ? data.canvasBlocks : FALLBACK_BLOCKS

  // Blok pertama selalu menjadi pintu masuk. Bila halaman desain tidak diawali
  // cover, seluruh blok dirender sebagai satu halaman biasa (tanpa gate).
  const gate = blockType(blocks[0]) === COVER_TYPE ? blocks[0] : null
  const detailBlocks = gate ? blocks.slice(1) : blocks
  const hasHeroBack = detailBlocks.some((block) => blockType(block) === 'EventHero')

  const sharedLayout = {
    theme: data.theme,
    basePath: data.basePath,
    locale: data.locale,
    layoutMode: data.layoutMode,
    tenantID: data.tenantID,
    invitation: data.context,
  }

  const components = getComponentRegistryMap()

  return (
    <>
      <InvitationViewTracker invitationKey={data.context.key} enabled={!data.isPreview} />

      {gate ? (
        <InvitationExperience
          cover={
            <CanvasRenderer
              layoutData={{ ...sharedLayout, canvasBlocks: [gate] }}
              rootElement="div"
              bare
              components={components}
            />
          }
          detail={
            <CanvasRenderer
              layoutData={{ ...sharedLayout, canvasBlocks: detailBlocks }}
              rootElement="div"
              components={components}
            />
          }
          showBackButton={!hasHeroBack}
        />
      ) : (
        <CanvasRenderer
          layoutData={{ ...sharedLayout, canvasBlocks: blocks }}
          components={components}
        />
      )}
    </>
  )
}
