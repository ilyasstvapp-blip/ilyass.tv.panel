import Navbar from "@/components/public/Navbar"
import HeroSection from "@/components/public/HeroSection"
import FeaturesSection from "@/components/public/FeaturesSection"
import ScreenshotsSection from "@/components/public/ScreenshotsSection"
import DownloadSection from "@/components/public/DownloadSection"
import Footer from "@/components/public/Footer"

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ScreenshotsSection />
      <DownloadSection />
      <Footer />
    </main>
  )
}
