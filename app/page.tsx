import { AbilityScenesSection } from "@/components/AbilityScenesSection";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc_0%,#f1f5f9_100%)]">
      <HeroSection />
      <AbilityScenesSection />
    </main>
  );
}
