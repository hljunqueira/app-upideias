import LandingNav from "@/components/landing/LandingNav";
import Preloader from "@/components/landing/Preloader";
import CustomCursor from "@/components/landing/CustomCursor";
import Hero from "@/components/landing/Hero";
import HorizontalWorld from "@/components/landing/HorizontalWorld";
import AnalyticsShowcase from "@/components/landing/AnalyticsShowcase";
import GiantMarquee from "@/components/landing/GiantMarquee";
import CreatorShowcase from "@/components/landing/CreatorShowcase";
import Cycle from "@/components/landing/Cycle";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main className="landing-page bg-upBlack [overflow-x:clip]">
      <Preloader />
      <CustomCursor />
      <LandingNav />
      <Hero />
      <HorizontalWorld />
      <AnalyticsShowcase />
      <GiantMarquee />
      <CreatorShowcase />
      <Cycle />
      <Pricing />
      <FinalCTA />
    </main>
  );
}
