import React, { useState } from 'react';
import { Plus, Minus, CreditCard, DollarSign, ShieldCheck, RefreshCw, Heart } from 'lucide-react';

const faqCategories = [
  { id: 1, label: "Health Card", icon: CreditCard },
  { id: 2, label: "Pricing & Payment", icon: DollarSign },
  { id: 3, label: "Card Usage & Benefits", icon: ShieldCheck },
  { id: 4, label: "Validity & Renewal", icon: RefreshCw },
  { id: 5, label: "Donation", icon: Heart },
];

const faqsByCategory = {
  1: [
    {
      id: 1,
      question: "Who is eligible for the Health Card?",
      answer: "",
    },
    {
      id: 2,
      question: "How do I apply for the Health Card?",
      answer:
        "You can apply online through our website, visit our office in person, or contact us via phone. The application process takes less than 10 minutes.",
    },
    {
      id: 3,
      question: "What documents are required for application?",
      answer: "",
    },
    {
      id: 4,
      question: "How long does it take to receive the card after applying?",
      answer: "",
    },
  ],
  2: [
    { id: 1, question: "What are the pricing plans?", answer: "" },
    { id: 2, question: "What payment methods are accepted?", answer: "" },
  ],
  3: [
    { id: 1, question: "Where can I use the Health Card?", answer: "" },
    { id: 2, question: "What benefits does the card provide?", answer: "" },
  ],
  4: [
    { id: 1, question: "When does the Health Card expire?", answer: "" },
    { id: 2, question: "How do I renew my card?", answer: "" },
  ],
  5: [
    { id: 1, question: "How can I donate?", answer: "" },
    { id: 2, question: "Is my donation tax deductible?", answer: "" },
  ],
};

const Faqs = () => {
  const [activeCategory, setActiveCategory] = useState(1);
  const [openFaq, setOpenFaq] = useState(2);

  const faqs = faqsByCategory[activeCategory] || [];

  return (
    <section style={{ backgroundColor: "#fdf8f2" }} className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12 gap-6">
          <div>
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 border border-[#F68E5F] text-[#F68E5F] rounded-full text-sm font-medium">
                FAQs
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Frequently<br />Asked Question
            </h2>
          </div>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed md:mt-16">
            Find quick answers to the most common questions about our services, process, and support
          </p>
        </div>

        {/* Body: Sidebar + FAQ List */}
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Categories */}
          <div className="flex flex-col gap-3 md:w-56 flex-shrink-0">
            {faqCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setOpenFaq(null); }}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    isActive
                      ? "bg-[#F68E5F] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion */}
          <div className="flex-1 flex flex-col gap-3">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-gray-500 flex-shrink-0 ml-4" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-500 flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && faq.answer && (
                    <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Faqs;