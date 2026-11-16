import { Block } from 'payload'
import { COMPONENT_REGISTRY } from '@/components/componentRegistry'
import { createDefaultBlock } from './defaultField'

// --- Blok inti / lama ---
import { heroBannerField } from './heroBannerField'
import { metricsTickerField } from './metricsTickerField'
import { navbarField } from './navbarField'
import { footerField } from './footerField'
import { contentSectionField } from './contentSectionField'
import { bentoGridField } from './bentoGridField'
import { enterpriseCalloutField } from './enterpriseCalloutField'
import { companyHubField } from './companyHubField'
import { faqHubField } from './faqHubField'
import { aiChatField } from './aiChatField'
import { featuresStepsField } from './featuresStepsField'
import { legalStatsField } from './legalStatsField'
import { trustComplianceField } from './trustComplianceField'
import { pricingTiersField } from './pricingTiersField'
import { profileHubField } from './profileHubField'
import { mediaCardGridField } from './mediaCardGridField'

// --- Blok bio ---
import { animatedPhotoBannerField } from './animatedPhotoBannerField'
import { appleVideoScrubField } from './appleVideoScrubField'
import { appleInteractiveShowcaseField } from './appleInteractiveShowcaseField'
import { bioProfileField } from './bioProfileField'
import { professionalCVField } from './professionalCVField'
import { documentFlipField } from './documentFlipField'

// --- Blok preset ---
import { featureMatrixField } from './featureMatrixField'
import { testimonialCarouselField } from './testimonialCarouselField'
import { processRoadmapField } from './processRoadmapField'
import { logoCloudField } from './logoCloudField'
import { interactiveTabsField } from './interactiveTabsField'
import { integrationGridField } from './integrationGridField'
import { resourceLibraryField } from './resourceLibraryField'
import { teamDirectoryField } from './teamDirectoryField'
import { newsletterCtaField } from './newsletterCtaField'
import { notificationBannerField } from './notificationBannerField'
import { comparisonSplitField } from './comparisonSplitField'
import { liveStatusField } from './liveStatusField'
import { galleryLightboxField } from './galleryLightboxField'
import { accordionDirectoryField } from './accordionDirectoryField'
import { advancedHtmlField } from './advancedHtmlField'
import { articleListField } from './articleListField'

/**
 * Peta kamus form manual untuk setiap tipe komponen di COMPONENT_REGISTRY.
 * Key HARUS sama persis dengan `type` di componentRegistry, karena
 * `getDynamicBlocks()` memakai key ini untuk memilih skema field.
 */
const customFieldMap: Record<string, Block> = {
  // Inti / lama
  HeroBanner: heroBannerField,
  MetricsTicker: metricsTickerField,
  Navbar: navbarField,
  Footer: footerField,
  ContentSection: contentSectionField,
  BentoGrid: bentoGridField,
  EnterpriseCallout: enterpriseCalloutField,
  CompanyHub: companyHubField,
  FAQHub: faqHubField,
  AIChatWidget: aiChatField,
  FeatureSteps: featuresStepsField,
  LegalStats: legalStatsField,
  TrustCompliance: trustComplianceField,
  PricingTiers: pricingTiersField,
  ProfileHub: profileHubField,
  MediaCardGrid: mediaCardGridField,

  // Bio
  AnimatedPhotoBanner: animatedPhotoBannerField,
  AppleVideoScrub: appleVideoScrubField,
  AppleInteractiveShowcase: appleInteractiveShowcaseField,
  BioProfile: bioProfileField,
  ProfessionalCV: professionalCVField,
  DocumentFlip: documentFlipField,

  // Konten
  ArticleList: articleListField,

  // Preset
  FeatureMatrix: featureMatrixField,
  TestimonialCarousel: testimonialCarouselField,
  ProcessRoadmap: processRoadmapField,
  LogoCloud: logoCloudField,
  InteractiveTabs: interactiveTabsField,
  IntegrationGrid: integrationGridField,
  ResourceLibrary: resourceLibraryField,
  TeamDirectory: teamDirectoryField,
  NewsletterCta: newsletterCtaField,
  NotificationBanner: notificationBannerField,
  ComparisonSplit: comparisonSplitField,
  LiveStatus: liveStatusField,
  GalleryLightbox: galleryLightboxField,
  AccordionDirectory: accordionDirectoryField,
  AdvancedHTML: advancedHtmlField,
}

/**
 * Menghasilkan daftar blok secara otomatis untuk Payload CMS
 * berdasarkan COMPONENT_REGISTRY. Komponen yang belum punya form khusus
 * akan memakai form generik dari createDefaultBlock.
 */
export const getDynamicBlocks = (): Block[] => {
  return COMPONENT_REGISTRY.map((item) => {
    if (customFieldMap[item.type]) {
      return customFieldMap[item.type]
    }

    return createDefaultBlock(item.type, item.variants)
  })
}
