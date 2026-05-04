import { AbilityScenesSection } from "@/components/AbilityScenesSection";
import { AbilityScenesIntroStage } from "@/components/AbilityScenesIntroStage";
import { HeroSection } from "@/components/HeroSection";
import { ProductProcessSection } from "@/components/ProductProcessSection";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F2F6]">
      <SmoothScrollProvider />
      <SiteHeader />
      <HeroSection />
      <div aria-hidden="true" className="h-[100px] w-full bg-[#F3F3F7]" />
      <AbilityScenesIntroStage />
      <AbilityScenesSection />
      <ProductProcessSection />
    </main>
  );
}
