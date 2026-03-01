import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServicesSection";
import AboutSection from "../components/AboutSection";
import WorksGallerySection from "../components/WorksGallerySection";
import ReviewsSection from "../components/ReviewsSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export default function Index() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />

      {/* LAVORI */}
      <WorksGallerySection />

      {/* RECENSIONI */}
      <ReviewsSection />

      {/* RICHIEDI PREVENTIVO */}
      <ContactSection />

      <Footer />
    </div>
  );
}