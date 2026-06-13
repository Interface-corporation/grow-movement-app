import { HeroSlider } from '@/components/landing/HeroSlider';
import { StatsBar } from '@/components/landing/StatsBar';
import { WhoWeAre } from '@/components/landing/WhoWeAre';
import { PartnerWithUs } from '@/components/landing/PartnerWithUs';
import { HowItWorks } from '@/components/landing/HowItWorks';
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
      <PartnerWithUs />
      <Partners />
      <HowItWorks />
      <PlatformPreview />
      <SuccessStories />
      <Testimonials />
      <StrongCTA />
      <FAQ />
      <ContactSection />
    </>
  );
}
