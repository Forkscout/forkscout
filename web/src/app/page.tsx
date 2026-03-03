import { HeroSection } from "@/components/home/hero-section";
import { TerminalDemo } from "@/components/home/terminal-demo";
import { StatsSection } from "@/components/home/stats-section";
import { TechMarquee } from "@/components/home/tech-marquee";
import { FeaturesSection } from "@/components/home/features-section";
import { ChannelsSection } from "@/components/home/channels-section";
import { UseCasesSection } from "@/components/home/use-cases-section";
import { ProvidersSection } from "@/components/home/providers-section";
import { CtaSection } from "@/components/home/cta-section";
import { AnimatedBg } from "@/components/home/animated-bg";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <AnimatedBg />
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      <HeroSection />
      <TerminalDemo />
      <StatsSection />
      <TechMarquee />
      <FeaturesSection />
      <ChannelsSection />
      <UseCasesSection />
      <ProvidersSection />
      <CtaSection />
    </div>
  );
}
