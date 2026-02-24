import React from "react";

const HospitalMap = () => {
  // Replace the src URL with your actual Google Maps embed URL
  // How to get embed URL:
  // 1. Go to Google Maps → search your hospital address
  // 2. Click Share → Embed a map → Copy the src URL from the iframe
  // 3. Paste it below in EMBED_URL

  const EMBED_URL =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.123456789!2d80.3318!3d26.4499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI2JzU5LjYiTiA4MMKwMTknNTQuNSJF!5e0!3m2!1sen!2sin!4v1234567890";

  return (
    <section style={{ backgroundColor: "#fdf8f2" }} className="px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ height: "260px" }}>
          <iframe
            src={EMBED_URL}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Hospital Location"
          />
        </div>
      </div>
    </section>
  );
};

export default HospitalMap;