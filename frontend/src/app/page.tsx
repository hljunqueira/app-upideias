import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import AnalyticsShowcase from "@/components/landing/AnalyticsShowcase";
import CreatorShowcase from "@/components/landing/CreatorShowcase";
import Cycle from "@/components/landing/Cycle";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main className="bg-upBlack overflow-x-hidden">
      <LandingNav />
      <Hero />
      <Problem />
      <AnalyticsShowcase />
      <CreatorShowcase />
      <Cycle />
      <Pricing />
      <FinalCTA />
    </main>
  );
}
