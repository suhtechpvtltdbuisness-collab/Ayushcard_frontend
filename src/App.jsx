import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Home sections
import HeroSection from "./components/sections/home/HeroSection";
import About from "./components/sections/home/About";
import ServicesSection from "./components/sections/home/ServicesSection";
import DonateSection from "./components/sections/home/DonateSection";
import TestimonialsSection from "./components/sections/home/TestimonialsSection";
import CertificationsSection from "./components/sections/home/CertificationsSection";
import Faqs from "./components/sections/home/Faqs";

// About page
import AboutHero from "./components/pages/about-dedi/AboutHero";
import TeamSection from "./components/pages/about-dedi/TeamSection";
import FocusAreas from "./components/pages/about-dedi/FocusAreas";
import ImageGallery from "./components/pages/about-dedi/ImageGallery";
import Members from "./components/pages/about-dedi/Members";
import AssociatedHospitalsHero from "./components/pages/about-dedi/associatedhospital/AssociatedHospitalsHero";
import ContactUs from "./components/pages/about-dedi/contact/ContactUs";
import HospitalHero from "./components/pages/about-dedi/hospitaldedipages/HospitalHero";
import HospitalAbout from "./components/pages/about-dedi/hospitaldedipages/HospitalAbout";
import MedicalServices from "./components/pages/about-dedi/hospitaldedipages/MedicalServices";
import HospitalFacilities from "./components/pages/about-dedi/hospitaldedipages/HospitalFacilities";
import HealthCardBanner from "./components/pages/about-dedi/hospitaldedipages/HealthCardBanner";
import NearbyHospitals from "./components/pages/about-dedi/hospitaldedipages/NearbyHospitals";
import ContactInfo from "./components/pages/about-dedi/hospitaldedipages/ContactInfo";
import HospitalMap from "./components/pages/about-dedi/hospitaldedipages/HospitalMap";

function App() {
  return (
    <Router>
      <Routes>

        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HeroSection />
              <About />
              <ServicesSection />
              <DonateSection />
              <TestimonialsSection />
              <CertificationsSection />
              <Faqs />
              <Footer />
            </>
          }
        />

        {/* About Page */}
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <AboutHero />
              <TeamSection />
              <FocusAreas />
              <ImageGallery />
              <Members />
              <Footer />
            </>
          }
        />

         {/* Associated Hospitals Page */}
        <Route
          path="/associated-hospitals"
          element={
            <>
              <Navbar />
              <AssociatedHospitalsHero />
              <Footer />
            </>
          }
        />

        {/* Hospital Detail Page */}
        {/* <Route
          path="/hospitals/:id"
          element={
            <>
              <Navbar />
              <HospitalHero />
              <HospitalAbout />
              <MedicalServices />
              <HospitalFacilities />
              <HealthCardBanner />
              <ContactInfo />
              <HospitalMap />
              
              <NearbyHospitals />
              <Footer />
            </>
          }
        /> */}

          {/* Contact us Page */}
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <ContactUs />
              <Footer />
            </>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;