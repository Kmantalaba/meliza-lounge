import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import SignatureServices from '@/components/sections/SignatureServices';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import Gallery from '@/components/sections/Gallery';
import Testimonials from '@/components/sections/Testimonials';
import Booking from '@/components/sections/Booking';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/Footer';
import AuthModal from '@/components/modals/AuthModal';
import BookingModal from '@/components/modals/BookingModal';
import ReviewModal from '@/components/modals/ReviewModal';
import FloatingReviewButton from '@/components/FloatingReviewButton';
import AdminDashboard from '@/components/AdminDashboard';
import PetalCanvas from '@/components/PetalCanvas';
import SparkleTrail from '@/components/SparkleTrail';

export default function Home() {
  return (
    <>
      <PetalCanvas />
      <SparkleTrail />
      <Navbar />
      <main>
        <Hero />
        <SignatureServices />
        <About />
        <Services />
        <Gallery />
        <Testimonials />
        <Booking />
        <Contact />
      </main>
      <Footer />

      <FloatingReviewButton />

      {/* Global modals */}
      <AuthModal />
      <BookingModal />
      <ReviewModal />
      <AdminDashboard />
    </>
  );
}
