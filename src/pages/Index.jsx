// src/pages/Index.jsx
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServicesSection";
import AboutSection from "../components/AboutSection";
import CoverageSection from "../components/CoverageSection";
// ❌ BrandsSection NON serve più qui (ora è dentro HeroSection)
import CertificationsSection from "../components/CertificationsSection";
import WorksGallerySection from "../components/WorksGallerySection";
import ReviewsSection from "../components/ReviewsSection";
import QuickQuoteSection from "../components/QuickQuoteSection";
import UsefulLinksSection from "../components/UsefulLinksSection";
import FaqSection from "../components/FaqSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

function Band({ tone = "plain", children }) {
  const style =
    tone === "soft"
      ? {
          background:
            "radial-gradient(900px 500px at 10% 0%, rgba(31,75,143,.10), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(214,27,27,.08), transparent 55%), rgba(255,255,255,.28)",
          borderTop: "1px solid rgba(15,23,42,.06)",
          borderBottom: "1px solid rgba(15,23,42,.06)",
        }
      : tone === "dark"
      ? {
          background:
            "radial-gradient(900px 500px at 15% 0%, rgba(255,255,255,.08), transparent 60%), linear-gradient(135deg, rgba(7,26,53,.96), rgba(23,58,111,.96))",
          borderTop: "1px solid rgba(255,255,255,.10)",
          borderBottom: "1px solid rgba(255,255,255,.10)",
        }
      : { background: "transparent" };

  return <div style={{ ...style }}>{children}</div>;
}

export default function Index() {
  return (
    <div>
      <Navbar />

      {/* HERO (contiene anche la strip Marchi integrata) */}
      <HeroSection />

      {/* Band alternata */}
      <Band tone="soft">
        <ServicesSection />
      </Band>

      <Band tone="plain">
        <AboutSection />
      </Band>

      <Band tone="soft">
        <CoverageSection />
      </Band>

      <Band tone="plain">
        <CertificationsSection />
      </Band>

      <Band tone="soft">
        <WorksGallerySection />
      </Band>

      <Band tone="plain">
        <ReviewsSection />
      </Band>

      {/* ✅ FAQ (consiglio "plain" o "soft": qui la metto plain per stacco pulito) */}
      <Band tone="plain">
        <FaqSection />
      </Band>

      <Band tone="soft">
        <UsefulLinksSection />
      </Band>

      <Band tone="dark">
        <QuickQuoteSection />
      </Band>

      <Band tone="plain">
        <ContactSection />
        <Footer />
      </Band>
    </div>
  );
}