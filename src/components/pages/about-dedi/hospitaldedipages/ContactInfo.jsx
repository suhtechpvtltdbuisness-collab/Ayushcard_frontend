import React from "react";
import { Phone, Clock, Mail, MapPin } from "lucide-react";
import { useLocation } from "react-router-dom";

const ContactInfo = () => {
  const location = useLocation();
  const hospital = location.state?.hospital;

  const address = hospital?.address || "3531, Infront Of Shiv Mandir, Awas Vikas Colony-1, Kanpur Nagar, Uttar Pradesh, 208019";
  const phone = hospital?.phone || "0512 251 9003";

  const contactItems = [
    {
      icon: Phone,
      label: "Phone Number",
      value: phone,
      isLink: true,
      href: `tel:${phone}`,
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: `24/7 Emergency OPD: 8:00 AM - 8:00 PM`,
      isLink: false,
    },
    {
      icon: Mail,
      label: "Email",
      value: "info@carehospital.com",
      isLink: true,
      href: "mailto:info@carehospital.com",
    },
    {
      icon: MapPin,
      label: "Address",
      value: address,
      isLink: false,
    },
  ];

  return (
    <section style={{ backgroundColor: "#fdf8f2" }} className="px-6 py-16">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-10">
          Contact Information
        </h2>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {contactItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i}>
                <div className="flex items-start gap-4 px-8 py-6">
                  {/* Orange circle icon */}
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-gray-900 font-semibold text-sm mb-1">{item.label}</p>
                    {item.isLink ? (
                      <a
                        href={item.href}
                        className="text-orange-500 text-sm hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">{item.value}</p>
                    )}
                  </div>
                </div>

                {/* Divider — not after last item */}
                {i < contactItems.length - 1 && (
                  <div className="border-t border-gray-100 mx-8" />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ContactInfo;