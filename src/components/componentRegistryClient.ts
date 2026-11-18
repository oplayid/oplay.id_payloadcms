import React from 'react'

// Impor Komponen Lama
import HeroBannerBlock from './blocks/HeroBannerBlock'
import LegalStatsBlock from './blocks/LegalStatsBlock'
import AIChatBlock from './blocks/AIChatBlock'
import NavbarBlock from './blocks/NavbarBlock'
import FooterBlock from './blocks/FooterBlock'
import ContentSectionBlock from './blocks/ContentSectionBlock'
import BentoGridBlock from './blocks/BentoGridBlock'
import EnterpriseCalloutBlock from './blocks/EnterpriseCalloutBlock'
import FeatureStepsBlock from './blocks/FeaturesStepsBlock'
import FAQHubBlock from './blocks/FAQHubBlock'
import TrustComplianceBlock from './blocks/TrustComplianceBlock'
import PricingTiersBlock from './blocks/PricingTiersBlock'
import CompanyHubBlock from './blocks/CompanyHubBlock'
import ProfileHubBlock from './blocks/ProfilHubBlock'
import MediaCardBlock from './blocks/MediaCardBlock'

// Impor 15 Komponen Preset Baru dari folder /preset
import MetricsTickerBlock from './preset/MetricsTickerBlock'
import FeatureMatrixBlock from './preset/FeatureMatrixBlock'
import TestimonialCarouselBlock from './preset/TestimonialCarouselBlock'
import ProcessRoadmapBlock from './preset/ProcessRoadmapBlock'
import LogoCloudBlock from './preset/LogoCloudBlock'
import InteractiveTabsBlock from './preset/InteractiveTabsBlock'
import IntegrationGridBlock from './preset/IntegrationGridBlock'
import ResourceLibraryBlock from './preset/ResourceLibraryBlock'
import TeamDirectoryBlock from './preset/TeamDirectoryBlock'
import NewsletterCtaBlock from './preset/NewsletterCtaBlock'
import NotificationBannerBlock from './preset/NotificationBannerBlock'
import ComparisonSplitBlock from './preset/ComparisonSplitBlock'
import LiveStatusBlock from './preset/LiveStatusBlock'
import GalleryLightboxBlock from './preset/GalleryLightboxBlock'
import AccordionDirectoryBlock from './preset/AccordionDirectoryBlock'

// Impor Komponen Preset Baru untuk Bio /Bio
import BioProfileBlock from '@/components/bio/BioProfileBlock'
import DocumentFlipBlock from '@/components/bio/DocumentFlipBlock'
import ProfessionalCVBlock from '@/components/bio/ProfessionalCVBlock'
import AnimatedPhotoBannerBlock from '@/components/bio/AnimatedPhotoBannerBlock'
import AppleInteractiveShowcaseBlock from '@/components/bio/AppleInteractiveShowcaseBlock'
import AppleVideoScrubBlock from '@/components/bio/AppleVideoScrubBlock'
import AdvancedHTMLBlock from '@/components/blocks/AdvancedHTMLBlock'
// Versi client (tanpa fetch server) agar aman dipakai di Live Preview.
import ArticleListBlockView from './blocks/ArticleListBlockView'
import InvitationCoverBlock from './blocks/invitation/InvitationCoverBlock'
import EventHeroBlock from './blocks/invitation/EventHeroBlock'
import EventDetailsBlock from './blocks/invitation/EventDetailsBlock'
import CountdownBlock from './blocks/invitation/CountdownBlock'
import InvitationGalleryBlock from './blocks/invitation/InvitationGalleryBlock'
import RsvpFormBlock from './blocks/invitation/RsvpFormBlock'
import GiftInfoBlock from './blocks/invitation/GiftInfoBlock'

export type ComponentDefinition = {
  type: string
  category: string
  component: React.ComponentType<any>
  variants: string[]
}

/**
 * Registry blok untuk render sisi klien (Live Preview Pages).
 * Harus tetap sinkron dengan `COMPONENT_REGISTRY` di `componentRegistry.ts`,
 * kecuali blok yang butuh data server diganti varian view-nya.
 */
export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  // --- KELOMPOK KOMPONEN UTAMA & LAMA ---
  {
    type: 'Navbar',
    category: 'Navigation',
    component: NavbarBlock,
    variants: [
      'navbar-standard',
      'navbar-cyber-terminal',
      'navbar-floating-island',
      'navbar-command-palette',
      'navbar-dual-tier',
      'navbar-dynamic-island',
      'navbar-editorial',
    ],
  },
  {
    type: 'HeroBanner',
    category: 'Header & Hero',
    component: HeroBannerBlock,
    variants: [
      'hero-standard',
      'hero-cyber-terminal',
      'hero-split-bento',
      'hero-holographic-glow',
      'hero-status-ticker',
      'hero-minimal-bottom-left',
      'hero-casual-elegant',
      'hero-saas-showcase',
    ],
  },
  {
    type: 'LegalStats',
    category: 'Analytics & Numbers',
    component: LegalStatsBlock,
    variants: ['default'],
  },
  {
    type: 'AIChatWidget',
    category: 'AI & Interactive',
    component: AIChatBlock,
    variants: ['default'],
  },
  {
    type: 'Footer',
    category: 'Navigation',
    component: FooterBlock,
    variants: [
      'footer-standard',
      'footer-terminal',
      'footer-massive-grid',
      'footer-minimal-center',
      'footer-status-bar',
    ],
  },
  {
    type: 'ContentSection',
    category: 'Content',
    component: ContentSectionBlock,
    variants: ['default'],
  },
  {
    type: 'BentoGrid',
    category: 'Layout & Grid',
    component: BentoGridBlock,
    variants: ['default'],
  },
  {
    type: 'EnterpriseCallout',
    category: 'Marketing & Conversion',
    component: EnterpriseCalloutBlock,
    variants: ['default'],
  },
  {
    type: 'FeatureSteps',
    category: 'Workflow & Steps',
    component: FeatureStepsBlock,
    variants: ['default'],
  },
  {
    type: 'FAQHub',
    category: 'FAQ & Glossary',
    component: FAQHubBlock,
    variants: ['default'],
  },
  {
    type: 'TrustCompliance',
    category: 'Security & Trust',
    component: TrustComplianceBlock,
    variants: ['default'],
  },
  {
    type: 'PricingTiers',
    category: 'Comparison & Pricing',
    component: PricingTiersBlock,
    variants: ['default'],
  },
  {
    type: 'CompanyHub',
    category: 'Company',
    component: CompanyHubBlock,
    variants: ['default'],
  },
  {
    type: 'ProfileHub',
    category: 'Company',
    component: ProfileHubBlock,
    variants: ['default'],
  },
  {
    type: 'MediaCardGrid',
    category: 'Media & Visuals',
    component: MediaCardBlock,
    variants: ['default'],
  },

  // --- KELOMPOK 15 KOMPONEN PRESET BARU ---
  {
    type: 'MetricsTicker',
    category: 'Analytics & Numbers',
    component: MetricsTickerBlock,
    variants: ['ticker-minimal', 'ticker-card', 'ticker-glow', 'ticker-vertical', 'ticker-compact'],
  },
  {
    type: 'FeatureMatrix',
    category: 'Comparison & Pricing',
    component: FeatureMatrixBlock,
    variants: [
      'matrix-standard',
      'matrix-highlight-middle',
      'matrix-side-cards',
      'matrix-terminal-style',
      'matrix-minimal-clean',
    ],
  },
  {
    type: 'TestimonialCarousel',
    category: 'Social Proof',
    component: TestimonialCarouselBlock,
    variants: [
      'testimonial-grid',
      'testimonial-featured-single',
      'testimonial-masonry',
      'testimonial-quote-bubble',
      'testimonial-minimal-slider',
      'testimonial-cards',
    ],
  },
  {
    type: 'ProcessRoadmap',
    category: 'Workflow & Steps',
    component: ProcessRoadmapBlock,
    variants: [
      'roadmap-horizontal-cards',
      'roadmap-vertical-timeline',
      'roadmap-numbered-steps',
      'roadmap-interactive-steps',
      'roadmap-compact-pills',
    ],
  },
  {
    type: 'LogoCloud',
    category: 'Branding & Partners',
    component: LogoCloudBlock,
    variants: [
      'logo-grid-monochrome',
      'logo-bordered-boxes',
      'logo-glow-cards',
      'logo-minimal-pills',
      'logo-row-clean',
    ],
  },
  {
    type: 'InteractiveTabs',
    category: 'Navigation & Content',
    component: InteractiveTabsBlock,
    variants: [
      'tabs-pill-top',
      'tabs-sidebar-layout',
      'tabs-grid-cards',
      'tabs-terminal-console',
      'tabs-minimal-underline',
    ],
  },
  {
    type: 'IntegrationGrid',
    category: 'Ecosystem & Apps',
    component: IntegrationGridBlock,
    variants: [
      'integration-grid-standard',
      'integration-horizontal-list',
      'integration-minimal-pills',
      'integration-glow-cards',
      'integration-category-grouped',
    ],
  },
  {
    type: 'ResourceLibrary',
    category: 'Documents & Files',
    component: ResourceLibraryBlock,
    variants: [
      'resource-card-grid',
      'resource-table-list',
      'resource-featured-download',
      'resource-category-tabs',
      'resource-minimal-card',
    ],
  },
  {
    type: 'TeamDirectory',
    category: 'People & Organization',
    component: TeamDirectoryBlock,
    variants: [
      'team-portrait-grid',
      'team-horizontal-card',
      'team-minimal-avatar',
      'team-interactive-overlay',
      'team-executive-spotlight',
    ],
  },
  {
    type: 'NewsletterCta',
    category: 'Marketing & Conversion',
    component: NewsletterCtaBlock,
    variants: [
      'newsletter-centered-box',
      'newsletter-split-banner',
      'newsletter-floating-bar',
      'newsletter-minimal-card',
      'newsletter-terminal-glow',
    ],
  },
  {
    type: 'NotificationBanner',
    category: 'Alerts & Announcements',
    component: NotificationBannerBlock,
    variants: [
      'banner-top-alert',
      'banner-floating-pill',
      'banner-with-icon',
      'banner-action-right',
      'banner-minimal-line',
    ],
  },
  {
    type: 'ComparisonSplit',
    category: 'Comparison & Analysis',
    component: ComparisonSplitBlock,
    variants: [
      'comparison-two-columns',
      'comparison-vs-badge',
      'comparison-table-format',
      'comparison-cards-stacked',
      'comparison-highlight-after',
    ],
  },
  {
    type: 'LiveStatus',
    category: 'System Monitoring',
    component: LiveStatusBlock,
    variants: [
      'status-list-standard',
      'status-card-grid',
      'status-compact-badge',
      'status-minimal-line',
      'status-terminal-panel',
    ],
  },
  {
    type: 'GalleryLightbox',
    category: 'Media & Visuals',
    component: GalleryLightboxBlock,
    variants: [
      'gallery-grid-standard',
      'gallery-masonry-style',
      'gallery-featured-hero',
      'gallery-horizontal-strip',
      'gallery-minimal-cards',
    ],
  },
  {
    type: 'AccordionDirectory',
    category: 'FAQ & Glossary',
    component: AccordionDirectoryBlock,
    variants: [
      'accordion-vertical-list',
      'accordion-boxed-cards',
      'accordion-category-grouped',
      'accordion-minimal-lines',
      'accordion-expanded-first',
    ],
  },

  // --- KELOMPOK BIO KOMPONEN PRESET BARU ---
  {
    type: 'BioProfile',
    category: 'Personal & Branding',
    component: BioProfileBlock,
    variants: ['bio-card-minimal', 'cv-modern-resume'],
  },
  {
    type: 'DocumentFlip',
    category: 'Content & Portfolio',
    component: DocumentFlipBlock,
    variants: ['dossier-folder'],
  },
  {
    type: 'ProfessionalCV',
    category: 'Legal & Portfolio',
    component: ProfessionalCVBlock,
    variants: ['default'],
  },
  {
    type: 'AnimatedPhotoBanner',
    category: 'Visual & Gallery',
    component: AnimatedPhotoBannerBlock,
    variants: ['apple-coverflow', 'apple-stack', 'apple-smooth-scroll'],
  },
  {
    type: 'AppleInteractiveShowcase',
    category: 'Visual & Gallery',
    component: AppleInteractiveShowcaseBlock,
    variants: ['hardware-video', 'bento-spotlight', 'sticky-stack', 'text-reveal'],
  },
  {
    type: 'AppleVideoScrub',
    category: 'Visual & Gallery',
    component: AppleVideoScrubBlock,
    variants: ['default'],
  },

  // --- KONTEN / ARTIKEL ---
  {
    type: 'ArticleList',
    category: 'Content',
    component: ArticleListBlockView,
    variants: ['article-grid', 'article-list', 'article-featured', 'article-compact'],
  },

  // --- UNDANGAN ---
  {
    type: 'InvitationCover',
    category: 'Undangan',
    component: InvitationCoverBlock,
    variants: ['cover-photo', 'cover-classic', 'cover-minimal'],
  },
  {
    type: 'EventHero',
    category: 'Undangan',
    component: EventHeroBlock,
    variants: ['hero-arch', 'hero-photo', 'hero-minimal'],
  },
  {
    type: 'EventDetails',
    category: 'Undangan',
    component: EventDetailsBlock,
    variants: ['details-cards', 'details-list', 'details-minimal'],
  },
  {
    type: 'Countdown',
    category: 'Undangan',
    component: CountdownBlock,
    variants: ['countdown-cards', 'countdown-inline'],
  },
  {
    type: 'InvitationGallery',
    category: 'Undangan',
    component: InvitationGalleryBlock,
    variants: ['gallery-grid', 'gallery-masonry', 'gallery-carousel'],
  },
  {
    type: 'RsvpForm',
    category: 'Undangan',
    component: RsvpFormBlock,
    variants: ['rsvp-card', 'rsvp-plain'],
  },
  {
    type: 'GiftInfo',
    category: 'Undangan',
    component: GiftInfoBlock,
    variants: ['gift-cards', 'gift-list'],
  },

  // --- KEBEBASAN PENUH (KHUSUS SUPERADMIN) ---
  {
    type: 'AdvancedHTML',
    category: 'Advanced',
    component: AdvancedHTMLBlock,
    variants: ['default'],
  },
]

export const getComponentRegistryClientMap = () => {
  return COMPONENT_REGISTRY.reduce(
    (acc, item) => {
      acc[item.type] = item.component
      return acc
    },
    {} as { [key: string]: React.ComponentType<any> },
  )
}
