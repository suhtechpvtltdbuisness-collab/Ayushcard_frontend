import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { getHealthCards } from './HealthCard';

const CreateHealthCard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    applicant: '',
    phone: '',
    address: '',
    status: 'Not verified',
    applicationFee: 120,
    members: []
  });

  const [newMember, setNewMember] = useState({ name: '', relation: '', age: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  const addMember = () => {
    if (newMember.name && newMember.relation && newMember.age) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { ...newMember, id: Date.now() }]
      }));
      setNewMember({ name: '', relation: '', age: '' });
    }
  };

  const handleSave = () => {
    const cards = getHealthCards();
    
    const isVerified = formData.status === 'Verified';
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-GB');
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    
    const newCard = {
      id: formData.cardId || `ASS-${Math.floor(1000 + Math.random() * 9000)}`,
      applicant: formData.applicant,
      phone: formData.phone,
      address: formData.address,
      dateApplied: todayStr,
      verificationDate: isVerified ? todayStr : "Pending",
      expiryDate: isVerified ? nextYear.toLocaleDateString('en-GB') : "Pending",
      status: formData.status,
      members: formData.members,
      payment: {
        applicationFee: 120,
        memberAddOns: formData.members.length * 10,
        totalPaid: 120 + formData.members.length * 10
      }
    };
    
    cards.unshift(newCard); // Add to the top of the list
    localStorage.setItem('health_cards_data', JSON.stringify(cards));

    alert(`Application for ${formData.applicant} submitted successfully!`);
    navigate('/admin/health-card');
  };

      const isVerified = formData.status === 'Verified';
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-GB');
      const nextYear = new Date(today);
      nextYear.setFullYear(today.getFullYear() + 1);
      const nextYearStr = nextYear.toLocaleDateString('en-GB');
      const displayVerificationDate = isVerified ? todayStr : "Pending";
      const displayExpiryDate = isVerified ? nextYearStr : "Pending";

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/health-card')}
            className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-[#22333B]">Create Application</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/health-card')}
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.applicant || !formData.phone}
            className="px-6 py-2 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-sm font-medium hover:bg-[#ff7535] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Applicant Information */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-6 text-[#4B5563]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h3 className="font-semibold text-[#22333B]">Applicant Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">FULL NAME <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="applicant"
                value={formData.applicant}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F]" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">PHONE NUMBER <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F]" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">ADDRESS</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                rows={3} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] resize-none"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Card Details */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-6 text-[#4B5563]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <h3 className="font-semibold text-[#22333B]">Card Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">CARD ID</label>
              <input 
                type="text" 
                name="cardId"
                value={formData.cardId}
                onChange={handleInputChange}
                placeholder="e.g. ASS-1234"
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F]" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Status</label>
              <div className="relative">
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#22333B] bg-white focus:outline-none focus:border-[#F68E5F] appearance-none cursor-pointer"
                >
                  <option value="Verified">Verified</option>
                  <option value="Not verified">Not verified</option>
                  <option value="Expired">Expired</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validity & Timeline */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-6 text-[#4B5563]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <h3 className="font-semibold text-[#22333B]">Validity & Timeline</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">DATE APPLIED</label>
              <input type="text" value={todayStr} readOnly className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#22333B] bg-[#F8FAFC] focus:outline-none cursor-default" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">VERIFICATION DATE</label>
              <input type="text" value={displayVerificationDate} readOnly className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none cursor-default ${displayVerificationDate === 'Pending' ? 'text-gray-400' : 'text-[#22333B]'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">EXPIRY DATE</label>
              <input type="text" value={displayExpiryDate} readOnly className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none cursor-default ${displayExpiryDate === 'Pending' ? 'text-gray-400' : 'text-[#22333B]'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
        {/* Members Management */}
        <div className="lg:col-span-2 border border-gray-200 rounded-xl bg-white flex flex-col h-fit">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-[#4B5563]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <h3 className="font-bold text-[#22333B]">Included Members ({formData.members.length})</h3>
                </div>
            </div>

            <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-12 gap-3 mb-3">
                    <div className="col-span-5">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Name</label>
                        <input type="text" name="name" value={newMember.name} onChange={handleMemberChange} className="w-full border border-gray-300 rounded md px-2 py-1.5 text-sm" placeholder="Member name" />
                    </div>
                    <div className="col-span-4">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Relation</label>
                        <input type="text" name="relation" value={newMember.relation} onChange={handleMemberChange} className="w-full border border-gray-300 rounded md px-2 py-1.5 text-sm" placeholder="e.g. Spouse" />
                    </div>
                    <div className="col-span-3">
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Age</label>
                        <input type="number" name="age" value={newMember.age} onChange={handleMemberChange} className="w-full border border-gray-300 rounded md px-2 py-1.5 text-sm" placeholder="Age" />
                    </div>
                </div>
                <button 
                  onClick={addMember}
                  disabled={!newMember.name || !newMember.relation || !newMember.age || formData.members.length >= 6}
                  className="w-full py-2 bg-[#2C3E50] text-[#FFFCFB] rounded-md text-sm font-medium hover:bg-[#1f2835] disabled:opacity-50"
                >
                    {formData.members.length >= 6 ? 'Maximum Members Reached (7/7)' : 'Add Member'}
                </button>
            </div>
            
            <div className="overflow-x-auto flex-1 h-full min-h-7.5">
                {formData.members.length > 0 ? (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F9FAFB]">
                    <tr>
                        <th className="py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-26">SR. NO</th>
                        <th className="py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">MEMBER NAME</th>
                        <th className="py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">RELATION</th>
                        <th className="py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16">AGE</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {formData.members.map((member, index) => (
                        <tr key={member.id}>
                        <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-[#22333B]">{member.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{member.relation}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{member.age}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                        No members added yet
                    </div>
                )}
            </div>
        </div>
        
        {/* Payment Summary */}
        <div className="bg-[#ffffff] rounded-xl text-[#22333B] border border-gray-200 p-6 flex flex-col justify-center h-fit">
          <h3 className="font-semibold mb-6 shrink-0">Payment Summary</h3>
          
          <div className="space-y-4 mb-6 shrink-0">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#22333B]">Application Fee</span>
              <span className="text-[#22333B] px-2 py-1">₹120.00</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-4">
              <span className="text-[#22333B]">Member Add-ons ({formData.members.length})</span>
              <span>₹{(formData.members.length * 10).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-[#000000] flex justify-between items-center shrink-0">
            <span className="font-bold">Total Paid</span>
            <span className="text-xl font-bold">₹{(120 + formData.members.length * 10).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CreateHealthCard;
