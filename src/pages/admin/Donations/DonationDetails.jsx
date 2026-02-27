import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getDonations } from './Donations';

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load data
  const donations = getDonations();
  const data = donations.find(d => d.id === id) || donations[0]; // fallback to first item

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-10" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/donations')}
          className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-[#22333B]">Enquiry Details</h2>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">Enquiry ID</label>
            <input 
              type="text" 
              value={data.id} 
              readOnly 
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-white cursor-default focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">Name</label>
            <input 
              type="text" 
              value={data.name} 
              readOnly 
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-white cursor-default focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">Contact Number</label>
            <input 
              type="text" 
              value={data.contact} 
              readOnly 
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-white cursor-default focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">Email</label>
            <input 
              type="text" 
              value={data.email || 'N/A'} 
              readOnly 
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-white cursor-default focus:outline-none" 
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-[16px] text-[#374151] mb-1.5">Location</label>
            <input 
              type="text" 
              value={data.location} 
              readOnly 
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-white cursor-default focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">Date</label>
            <input 
              type="text" 
              value={data.date} 
              readOnly 
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-white cursor-default focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-[16px] text-[#374151] mb-1.5">Time</label>
            <input 
              type="text" 
              value={data.time} 
              readOnly 
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] text-[#22333B] bg-white cursor-default focus:outline-none" 
            />
          </div>
        </div>

        {/* Row 3 - Message */}
        <div>
          <label className="block text-[16px] text-[#374151] mb-1.5">Message</label>
          <textarea 
            value={data.message} 
            readOnly 
            rows={4}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[16px] leading-relaxed text-[#22333B] bg-[#F9FAFB] cursor-default focus:outline-none resize-none" 
          />
        </div>

      </div>
    </div>
  );
};

export default DonationDetails;
