import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServicesSection";
import AboutSection from "../components/AboutSection";

import CoverageSection from "../components/CoverageSection";
import BrandsSection from "../components/BrandsSection";
import CertificationsSection from "../components/CertificationsSection";
import WorksGallerySection from "../components/WorksGallerySection";
import ReviewsSection from "../components/ReviewsSection";
import QuickQuoteSection from "../components/QuickQuoteSection";

import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export default function Index() {
  return (
    <div>
      <Navbar />
      <HeroSection />

      <ServicesSection />
      <AboutSection />

      <CoverageSection />
      <BrandsSection />
      <CertificationsSection />

      <WorksGallerySection />

      <ReviewsSection />

      <QuickQuoteSection />

      <ContactSection />
      <Footer />
    </div>
  );
}