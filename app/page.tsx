import { AbilityCardsTetrisStage } from "@/components/AbilityCardsTetrisStage";
import { AbilityScenesIntroStage } from "@/components/AbilityScenesIntroStage";
import { HeroSection } from "@/components/HeroSection";
import { HeroToSecondTransitionZone } from "@/components/HeroToSecondTransitionZone";
import { ProductProcessSection } from "@/components/ProductProcessSection";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F2F6]">
      <SmoothScrollProvider />
      <SiteHeader />
      <HeroSection />
      <HeroToSecondTransitionZone />
      <AbilityScenesIntroStage />
      <AbilityCardsTetrisStage />
      <ProductProcessSection />
    </main>
  );
}
