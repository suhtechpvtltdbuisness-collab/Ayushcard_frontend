import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Auth
import Login from "./pages/auth/Login";

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

// Admin Interface
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import HealthCard from "./pages/admin/HealthCard/HealthCard";
import HealthCardDetails from "./pages/admin/HealthCard/HealthCardDetails";
import CreateHealthCard from "./pages/admin/HealthCard/CreateHealthCard";
import Partners from "./pages/admin/Partners/Partners";
import PartnerDetails from "./pages/admin/Partners/PartnerDetails";
import CreatePartner from "./pages/admin/Partners/CreatePartner";
import Donations from "./pages/admin/Donations/Donations";
import DonationDetails from "./pages/admin/Donations/DonationDetails";

// HR & Payroll
import Employees from "./pages/admin/hr/employees/Employees";
import EmployeeDetails from "./pages/admin/hr/employees/EmployeeDetails";
import CreateEmployee from "./pages/admin/hr/employees/CreateEmployee";

import Salary from "./pages/admin/hr/salary/Salary";
import SalaryDetails from "./pages/admin/hr/salary/SalaryDetails";
import CreateSalary from "./pages/admin/hr/salary/CreateSalary";

function App() {
  return (
    <Router>
      <Routes>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

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

        {/* Admin Dashboard — requires valid (non-expired) JWT */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="health-card" element={<HealthCard />} />
            <Route path="health-card/create" element={<CreateHealthCard />} />
            <Route path="health-card/:id" element={<HealthCardDetails />} />
            <Route path="partners" element={<Partners />} />
            <Route path="partners/create" element={<CreatePartner />} />
            <Route path="partners/:id" element={<PartnerDetails />} />
            <Route path="donations" element={<Donations />} />
            <Route path="donations/:id" element={<DonationDetails />} />
            <Route path="hr/employees" element={<Employees />} />
            <Route path="hr/employees/create" element={<CreateEmployee />} />
            <Route path="hr/employees/:id" element={<EmployeeDetails />} />
            <Route path="hr/salary" element={<Salary />} />
            <Route path="hr/salary/create" element={<CreateSalary />} />
            <Route path="hr/salary/:id" element={<SalaryDetails />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;