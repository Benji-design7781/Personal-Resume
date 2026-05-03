import { AbilityScenesSection } from "@/components/AbilityScenesSection";
import { HeroSection } from "@/components/HeroSection";
import { ProductProcessSection } from "@/components/ProductProcessSection";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F2F6]">
      <SiteHeader />
      <HeroSection />
      <AbilityScenesSection />
      <ProductProcessSection />
    </main>
  );
}
