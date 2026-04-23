import { HeroSlider } from '@/components/landing/HeroSlider';
import { StatsBar } from '@/components/landing/StatsBar';
import { WhoWeAre } from '@/components/landing/WhoWeAre';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pathways } from '@/components/landing/Pathways';
import { PlatformPreview } from '@/components/landing/PlatformPreview';
import { SuccessStories } from '@/components/landing/SuccessStories';
import { Testimonials } from '@/components/landing/Testimonials';
import { Partners } from '@/components/landing/Partners';
import { StrongCTA } from '@/components/landing/StrongCTA';
import { FAQ } from '@/components/landing/FAQ';
import { ContactSection } from '@/components/landing/ContactSection';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <StatsBar />
      <WhoWeAre />
      <WhyChooseUs />
      <HowItWorks />
      <Pathways />
      <PlatformPreview />
      <SuccessStories />
      <Testimonials />
      <Partners />
      <StrongCTA />
      <FAQ />
      <ContactSection />
    </>
  );
}
