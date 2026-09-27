import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import FeatureBar from "./components/FeatureBar.jsx";
import NewArrivals from "./components/NewArrivals.jsx";
import CategoryGrid from "./components/CategoryGrid.jsx";
import BrandStory from "./components/BrandStory.jsx";
import Sustainability from "./components/Sustainability.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Lookbook from "./components/Lookbook.jsx";
import Newsletter from "./components/Newsletter.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <AnnouncementBar />
      <Navbar cartCount={0} />
      <main>
        <Hero />
        <FeatureBar />
        <NewArrivals />
        <CategoryGrid />
        <BrandStory />
        <Sustainability />
        <Testimonials />
        <Lookbook />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
