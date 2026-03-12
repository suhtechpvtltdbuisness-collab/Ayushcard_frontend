import React from "react";
import AyushCardHero from "../components/pages/ayush-card/AyushCardHero";
import AyushCardAbout from "../components/pages/ayush-card/AyushCardAbout";
import AyushCardBenefits from "../components/pages/ayush-card/AyushCardBenefits";
import AyushCardEligibility from "../components/pages/ayush-card/AyushCardEligibility";
import AyushCardHowToApply from "../components/pages/ayush-card/AyushCardHowToApply";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const AyushCardPage = () => {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <AyushCardHero />
      <AyushCardAbout />
      <AyushCardBenefits />
      <AyushCardEligibility />
      <AyushCardHowToApply />
      <Footer />
    </div>
  );
};

export default AyushCardPage;
