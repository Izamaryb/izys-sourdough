import {
  FeaturedProductsSection,
  HeroSection,
  HowItWorksSection,
  TestimonialsSection,
} from '@/components/landing';
import { PageContainer, SectionDivider } from '@/components/layout';

export default function Home() {
  return (
    <PageContainer>
      <HeroSection />
      <HowItWorksSection />
      <SectionDivider />
      <FeaturedProductsSection />
      <SectionDivider />
      <TestimonialsSection />
    </PageContainer>
  );
}
