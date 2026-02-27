import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

import { getHealthCards } from './HealthCard';

const StatusBadge = ({ status }) => {
  let bg = '';
  let dot = '';
  let text = '';

  switch (status) {
    case 'Not verified':
      bg = 'bg-[#FFA10033]';
      dot = 'bg-[#FFA100]';
      text = 'text-[#FFA100]';
      break;
    case 'Verified':
      bg = 'bg-[#76DB1E33]';
      dot = 'bg-[#76DB1E]';
      text = 'text-[#76DB1E]';
      break;
    case 'Expired':
      bg = 'bg-[#FF383C33]';
      dot = 'bg-[#FF383C]';
      text = 'text-[#FF383C]';
      break;
    default:
      bg = 'bg-gray-100';
      dot = 'bg-gray-400';
      text = 'text-gray-600';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};

const HealthCardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(location.state?.editMode || false);

  const healthCards = getHealthCards();
  const data = healthCards.find(c => c.id === id) || healthCards[0];

  const [verificationDate, setVerificationDate] = useState(data.verificationDate);
  const [expiryDate, setExpiryDate] = useState(data.expiryDate);
  const [status, setStatus] = useState(data.status);

  const handleSave = () => {
    const updatedCards = healthCards.map(c => {
      if (c.id === data.id) {
        return { ...c, verificationDate, expiryDate, status };
      }
      return c;
    });
    localStorage.setItem('health_cards_data', JSON.stringify(updatedCards));
    setIsEditing(false);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    if (val === 'Verified') {
      const d = new Date();
      setVerificationDate(d.toLocaleDateString('en-GB'));
      d.setFullYear(d.getFullYear() + 1);
      setExpiryDate(d.toLocaleDateString('en-GB'));
    } else if (val === 'Not verified') {
      setVerificationDate('Pending');
      setExpiryDate('Pending');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#111827]">Application Details</h2>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-[#F68E5F] text-white rounded-lg text-sm font-medium hover:bg-[#ff702d] transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-200 bg-[#F68E5F] rounded-lg text-sm font-medium text-white hover:bg-[#ff702d] flex items-center gap-2"
            >
              Edit
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Applicant Information */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-6 text-[#4B5563]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h3 className="font-bold text-[16px] text-[#1E293B]">Applicant Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">FULL NAME</label>
              <input type="text" defaultValue={data.applicant} readOnly={!isEditing} className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none ${!isEditing ? 'bg-[#F8FAFC] cursor-default' : 'bg-white'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">PHONE NUMBER</label>
              <input type="text" defaultValue={data.phone} readOnly={!isEditing} className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none ${!isEditing ? 'bg-[#F8FAFC] cursor-default' : 'bg-white'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">ADDRESS</label>
              <textarea readOnly={!isEditing} rows={2} className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none resize-none ${!isEditing ? 'bg-[#F8FAFC] cursor-default' : 'bg-white'}`} defaultValue={data.address}></textarea>
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-6 text-[#4B5563]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <h3 className="font-bold text-[16px] text-[#1E293B]">Card Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">CARD ID</label>
              <input type="text" defaultValue={data.id} readOnly={!isEditing} className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none ${!isEditing ? 'bg-[#F8FAFC] cursor-default' : 'bg-white'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">Status</label>
              {isEditing ? (
                <div className="relative">
                  <select 
                    value={status} 
                    onChange={handleStatusChange}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#111827] bg-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Not verified">Not verified</option>
                    <option value="Expired">Expired</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              ) : (
                <div>
                  <StatusBadge status={status} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validity & Timeline */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-6 text-[#4B5563]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <h3 className="font-bold text-[16px] text-[#1E293B]">Validity & Timeline</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">DATE APPLIED</label>
              <input type="text" defaultValue={data.dateApplied} readOnly className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none bg-[#F8FAFC] cursor-default`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">VERIFICATION DATE</label>
              <input type="text" value={verificationDate} readOnly className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#111827] bg-[#F8FAFC] focus:outline-none cursor-default" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5">EXPIRY DATE</label>
              <input type="text" value={expiryDate} readOnly className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#111827] bg-[#F8FAFC] focus:outline-none cursor-default" />
              <p className="text-[10px] text-[#94A3B8] mt-1.5">Auto-calculates remaining days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Included Members */}
        <div className="lg:col-span-2 border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 text-[#4B5563]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <h3 className="font-bold text-[16px] text-[#1E293B]">Included Members ({data.members.length})</h3>
            </div>
            <button className="text-sm font-semibold text-[#475569] hover:text-[#111827]">Manage Members</button>
          </div>
          
          <div className="overflow-x-auto flex-1 h-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider w-24">SR. NO</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">MEMBER NAME</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">RELATION</th>
                  <th className="py-3 px-6 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">AGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.members.map((member, index) => (
                  <tr key={index}>
                    <td className="py-4 px-6 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-[#111827]">{member.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{member.relation}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{member.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-[#F68E5F] rounded-xl text-white p-6 flex flex-col justify-center h-fit">
          <h3 className="font-semibold mb-6 shrink-0">Payment Summary</h3>
          
          <div className="space-y-4 mb-6 shrink-0">
            <div className="flex justify-between text-sm">
              <span className="text-[#FFFFFF]">Application Fee</span>
              <span>₹120.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#FFFFFF]">Member Add-ons ({data.members.length})</span>
              <span>₹{(data.members.length * 10).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-[#FFFFFF] flex justify-between items-center shrink-0">
            <span className="font-bold">Total Paid</span>
            <span className="text-xl font-bold">₹{(120 + data.members.length * 10).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCardDetails;
