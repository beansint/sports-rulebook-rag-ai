import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TrustStrip } from "./components/TrustStrip";
import { DashboardPreview } from "./components/DashboardPreview";
import { FeatureBlocks } from "./components/FeatureBlocks";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { JsonLd } from "./components/JsonLd";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-brand-black text-white">
      <JsonLd />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <DashboardPreview />
        <FeatureBlocks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
