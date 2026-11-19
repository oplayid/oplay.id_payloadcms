export type ComponentDefinitionMeta = {
  type: string
  category: string
  variants: string[]
}

/**
 * Metadata blok terpusat (tanpa referensi komponen React).
 *
 * Dipakai oleh konfigurasi Payload (`collections/blocks`) untuk membangun daftar
 * blocks, dan oleh registry komponen untuk memastikan tipe/varian sinkron, tanpa
 * menarik implementasi komponen (dan dependensi server/client-nya) ke bundle
 * admin yang tidak membutuhkannya.
 */
export const COMPONENT_REGISTRY_META: ComponentDefinitionMeta[] = [
  // --- KELOMPOK KOMPONEN UTAMA & LAMA ---
  {
    type: 'Navbar',
    category: 'Navigation',
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
    variants: ['default'],
  },
  {
    type: 'AIChatWidget',
    category: 'AI & Interactive',
    variants: ['default'],
  },
  {
    type: 'Footer',
    category: 'Navigation',
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
    variants: ['default'],
  },
  {
    type: 'BentoGrid',
    category: 'Layout & Grid',
    variants: ['default'],
  },
  {
    type: 'EnterpriseCallout',
    category: 'Marketing & Conversion',
    variants: ['default'],
  },
  {
    type: 'FeatureSteps',
    category: 'Workflow & Steps',
    variants: ['default'],
  },
  {
    type: 'FAQHub',
    category: 'FAQ & Glossary',
    variants: ['default'],
  },
  {
    type: 'TrustCompliance',
    category: 'Security & Trust',
    variants: ['default'],
  },
  {
    type: 'PricingTiers',
    category: 'Comparison & Pricing',
    variants: ['default'],
  },
  {
    type: 'CompanyHub',
    category: 'Company',
    variants: ['default'],
  },
  {
    type: 'ProfileHub',
    category: 'Company',
    variants: ['default'],
  },
  {
    type: 'MediaCardGrid',
    category: 'Media & Visuals',
    variants: ['default'],
  },

  // --- KELOMPOK 15 KOMPONEN PRESET BARU ---
  {
    type: 'MetricsTicker',
    category: 'Analytics & Numbers',
    variants: ['ticker-minimal', 'ticker-card', 'ticker-glow', 'ticker-vertical', 'ticker-compact'],
  },
  {
    type: 'FeatureMatrix',
    category: 'Comparison & Pricing',
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
    variants: ['bio-card-minimal', 'cv-modern-resume'],
  },
  {
    type: 'DocumentFlip',
    category: 'Content & Portfolio',
    variants: ['dossier-folder'],
  },
  {
    type: 'ProfessionalCV',
    category: 'Legal & Portfolio',
    variants: ['default'],
  },
  {
    type: 'AnimatedPhotoBanner',
    category: 'Visual & Gallery',
    variants: ['apple-coverflow', 'apple-stack', 'apple-smooth-scroll'],
  },
  {
    type: 'TeamMembersBanner',
    category: 'People & Organization',
    variants: ['apple-coverflow', 'apple-stack', 'apple-smooth-scroll'],
  },
  {
    type: 'AppleInteractiveShowcase',
    category: 'Visual & Gallery',
    variants: ['hardware-video', 'bento-spotlight', 'sticky-stack', 'text-reveal'],
  },
  {
    type: 'AppleVideoScrub',
    category: 'Visual & Gallery',
    variants: ['default'],
  },

  // --- KONTEN / ARTIKEL ---
  {
    type: 'ArticleList',
    category: 'Content',
    variants: ['article-grid', 'article-list', 'article-featured', 'article-compact'],
  },
  {
    type: 'MemberList',
    category: 'People & Organization',
    variants: ['member-grid', 'member-list', 'member-compact'],
  },

  // --- UNDANGAN ---
  {
    type: 'InvitationCover',
    category: 'Undangan',
    variants: ['cover-photo', 'cover-classic', 'cover-minimal'],
  },
  {
    type: 'EventHero',
    category: 'Undangan',
    variants: ['hero-arch', 'hero-photo', 'hero-minimal'],
  },
  {
    type: 'EventDetails',
    category: 'Undangan',
    variants: ['details-cards', 'details-list', 'details-minimal'],
  },
  {
    type: 'Countdown',
    category: 'Undangan',
    variants: ['countdown-cards', 'countdown-inline'],
  },
  {
    type: 'EventCountdown',
    category: 'Umum',
    variants: ['countdown-cards', 'countdown-inline', 'countdown-minimal'],
  },
  {
    type: 'LocationMap',
    category: 'Umum',
    variants: ['map-card', 'map-coordinate', 'map-minimal'],
  },
  {
    type: 'InvitationGallery',
    category: 'Undangan',
    variants: ['gallery-grid', 'gallery-masonry', 'gallery-carousel'],
  },
  {
    type: 'RsvpForm',
    category: 'Undangan',
    variants: ['rsvp-card', 'rsvp-plain'],
  },
  {
    type: 'GiftInfo',
    category: 'Undangan',
    variants: ['gift-cards', 'gift-list'],
  },

  // --- KEBEBASAN PENUH (KHUSUS SUPERADMIN) ---
  {
    type: 'AdvancedHTML',
    category: 'Advanced',
    variants: ['default'],
  },
]
