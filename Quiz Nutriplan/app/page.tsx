import { StickyHeader } from "@/components/sticky-header"
import { UrgencyBanner } from "@/components/urgency-banner"
import { HeroSection } from "@/components/hero-section"
import { VideoSection } from "@/components/video-section"
import { StorySection } from "@/components/story-section"
import { EmotionalHooksSection } from "@/components/emotional-hooks-section"
import { TargetAudienceSection } from "@/components/target-audience-section"
import { RecipeCategoriesSection } from "@/components/recipe-categories-section"
import { StatsSection } from "@/components/stats-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { TransformationsSection } from "@/components/transformations-section"
import { FeaturesSection } from "@/components/features-section"
import { BonusesSection } from "@/components/bonuses-section"
import { AppPreviewSection } from "@/components/app-preview-section"
import { PricingSection } from "@/components/pricing-section"
import { GuaranteeSection } from "@/components/guarantee-section"
import { FaqSection } from "@/components/faq-section"
import { FooterCta } from "@/components/footer-cta"

export default function NutriplanPage() {
  return (
    <main>
      <StickyHeader />
      <UrgencyBanner />
      <HeroSection />
      <VideoSection />
      <StorySection />
      <EmotionalHooksSection />
      <TargetAudienceSection />
      <RecipeCategoriesSection />
      <StatsSection />
      <TestimonialsSection />
      <TransformationsSection />
      <FeaturesSection />
      <BonusesSection />
      <AppPreviewSection />
      <PricingSection />
      <GuaranteeSection />
      <FaqSection />
      <FooterCta />
    </main>
  )
}
