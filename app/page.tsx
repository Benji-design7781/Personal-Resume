import { AbilityCardsTetrisStage } from "@/components/AbilityCardsTetrisStage";
import { HeroSection } from "@/components/HeroSection";
import { HeroToSecondTransitionZone } from "@/components/HeroToSecondTransitionZone";
import { ProductProcessBridgeSection } from "@/components/ProductProcessBridgeSection";
import { ProductProcessSection } from "@/components/ProductProcessSection";
import { ProductProcessV2Section } from "@/components/ProductProcessV2Section";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#EBEAE4]">
      <SmoothScrollProvider />
      <SiteHeader />
      <HeroSection />
      <HeroToSecondTransitionZone />
      <div
        aria-hidden="true"
        data-ability-lower-collapse-sentinel="true"
        style={{ height: 0 }}
      />
      <div
        data-ability-lower-shell="true"
        style={{
          position: "relative",
        }}
      >
        <AbilityCardsTetrisStage />
      </div>
      <ProductProcessBridgeSection />
      <ProductProcessV2Section />
      {/* <ProductProcessSection /> */}
    </main>
  );
}
