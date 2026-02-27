import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Plus, X, Upload } from 'lucide-react';
import { getPartners } from './Partners';

const AddDoctorModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    timeFrom: '',
    timeTo: '',
    location: '',
    days: [],
    imagePreview: null
  });
  const fileInputRef = React.useRef(null);

  if (!isOpen) return null;

  const daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.specialty || formData.days.length === 0) return;
    onAdd({
      id: Math.random(),
      name: formData.name,
      specialty: formData.specialty,
      timeFrom: formData.timeFrom || '09:00 AM',
      timeTo: formData.timeTo || '05:00 PM',
      days: formData.days,
      image: formData.imagePreview || 'female' // use uploaded image or default
    });
    setFormData({ name: '', specialty: '', timeFrom: '', timeTo: '', location: '', days: [], imagePreview: null });
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div className="bg-white rounded-xl w-full max-w-lg animate-in zoom-in-95 duration-200" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-[#22333B]">Add Doctor</h3>
            <p className="text-sm text-[#6B7280]">Add new Doctor Details</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#22333B] transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full mb-3 flex items-center justify-center overflow-hidden border border-gray-200">
              {formData.imagePreview ? (
                <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="text-[#9CA3AF]" size={24} />
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-[#22333B] hover:bg-gray-50"
            >
              Upload Profile Picture
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#22333B] mb-1.5">Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F]" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#22333B] mb-1.5">Specialty <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#22333B] mb-1.5">Timing <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-3">
                <input 
                  type="time" 
                  value={formData.timeFrom}
                  onChange={(e) => setFormData({...formData, timeFrom: e.target.value})}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F]" 
                />
                <span className="text-sm text-gray-500">To</span>
                <input 
                  type="time" 
                  value={formData.timeTo}
                  onChange={(e) => setFormData({...formData, timeTo: e.target.value})}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F]" 
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-[#22333B] mb-1.5">Location <span className="text-red-500">*</span></label>
            <select 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F]"
            >
              <option value="">Select location...</option>
              <option value="Main Building">Main Building</option>
              <option value="Annex">Annex</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-[#22333B] mb-1.5">Days <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {daysList.map(day => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                    formData.days.includes(day) 
                      ? 'bg-[#F68E5F] border-[#ff6e2b] text-[#FFFCFB]' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#22333B] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-sm font-medium hover:bg-[#ff6e2b] transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PartnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(location.state?.editMode || false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Load data
  const partners = getPartners();
  const data = partners.find(p => p.id === id) || partners[0]; // fallback to first item

  // Form States
  const [details, setDetails] = useState(data.details);
  const [specializations, setSpecializations] = useState(data.specializations.join(', '));
  const [doctors, setDoctors] = useState(data.doctors);
  const [doctorSearch, setDoctorSearch] = useState('');

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleSave = () => {
    const updatedPartners = partners.map(p => {
      if (p.id === data.id) {
        return { 
          ...p, 
          details, 
          specializations: specializations.split(',').map(s => s.trim()).filter(Boolean),
          doctors 
        };
      }
      return p;
    });
    localStorage.setItem('partners_data', JSON.stringify(updatedPartners));
    setIsEditing(false);
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = (doctor) => {
    setDoctors([...doctors, doctor]);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/partners')}
            className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B]">Partner Details</h2>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-[15px] font-medium text-[#374151] hover:bg-gray-50 bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff702d] transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff6e2b] flex items-center gap-2 transition-colors"
            >
              Edit
              <img src="/admin_images/Edit 3.svg" alt="" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Left Side Profile Card */}
        <div className="w-full lg:w-[320px] shrink-0 ">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 flex flex-col items-center h-full justify-between" style={{ boxShadow: '0px 1px 2px 0px #0000000D' }}>
            <div className="flex flex-col items-center pt-4">
              <div className="w-24 h-24 rounded-full bg-[#94A3B8] text-[#FFFCFB] flex items-center justify-center text-3xl font-serif mb-4 shadow-inner">
                {data.orgName.split(' ').map(n => n[0]).join('').substring(0, 3)}
              </div>
              <h3 className="text-2xl font-bold text-[#22333B] text-center mb-3 font-serif leading-tight">
                {data.orgName}
              </h3>
              <div className="px-4 py-1 bg-[#F8FAFC] text-[#4B5563] rounded-full text-sm font-medium flex items-center gap-1.5 mb-8">
                <img src="/admin_images/partner.svg" alt="" className="w-3.5 h-3.5" />
                {data.type}
              </div>
            <div className="flex justify-between w-full border-t border-[#E5E7EB] pt-6 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#9A9A9A]">{data.rating}</p>
                <p className="text-[12px] font-semibold text-[#9A9A9A] tracking-widest uppercase mt-1">RATING</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#9A9A9A]">{data.members}</p>
                <p className="text-[12px] font-semibold text-[#9A9A9A] tracking-widest uppercase mt-1">MEMBERS</p>
              </div>
            </div>
            </div>

            
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Organization Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6" style={{ boxShadow: '0px 1px 2px 0px #0000000D' }}>
            <h3 className="text-[16px] font-bold text-[#22333B] mb-5">Organization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Registration Number</label>
                <input 
                  type="text" 
                  name="registrationNumber"
                  value={details.registrationNumber} 
                  onChange={handleDetailChange}
                  readOnly={!isEditing} 
                  className={`w-full border border-[#D9D9D9] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none ${!isEditing ? 'bg-white cursor-default' : 'bg-white focus:border-[#F68E5F]'}`} 
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Partner ID</label>
                <input 
                  type="text" 
                  name="partnerId"
                  value={details.partnerId} 
                  onChange={handleDetailChange}
                  readOnly={!isEditing} 
                  className={`w-full border border-[#D9D9D9] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none ${!isEditing ? 'bg-white cursor-default' : 'bg-white focus:border-[#F68E5F]'}`} 
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Establishment Year</label>
                <input 
                  type="date" 
                  name="establishmentYear"
                  value={details.establishmentYear} 
                  onChange={handleDetailChange}
                  readOnly={!isEditing} 
                  className={`w-full border border-[#D9D9D9] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none ${!isEditing ? 'bg-white cursor-default' : 'bg-white focus:border-[#F68E5F]'}`} 
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Bed Capacity</label>
                <input 
                  type="number" 
                  name="bedCapacity"
                  value={details.bedCapacity} 
                  onChange={handleDetailChange}
                  readOnly={!isEditing} 
                  className={`w-full border border-[#D9D9D9] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none ${!isEditing ? 'bg-white cursor-default' : 'bg-white focus:border-[#F68E5F]'}`} 
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">staff count</label>
                <input 
                  type="number" 
                  name="staffCount"
                  value={details.staffCount} 
                  onChange={handleDetailChange}
                  readOnly={!isEditing} 
                  className={`w-full border border-[#D9D9D9] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none ${!isEditing ? 'bg-white cursor-default' : 'bg-white focus:border-[#F68E5F]'}`} 
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Ambulance Service</label>
                <input 
                  type="text" 
                  name="ambulanceService"
                  value={details.ambulanceService} 
                  onChange={handleDetailChange}
                  readOnly={!isEditing} 
                  className={`w-full border border-[#D9D9D9] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none ${!isEditing ? 'bg-white cursor-default' : 'bg-white focus:border-[#F68E5F]'}`} 
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">emergency services</label>
                <select 
                  name="emergencyServices"
                  value={details.emergencyServices}
                  onChange={handleDetailChange}
                  disabled={!isEditing}
                  className={`w-full border border-[#D9D9D9] rounded-lg px-3 py-2.5 text-sm focus:outline-none ${!isEditing ? 'bg-white text-[#22333B] cursor-default appearance-none' : 'bg-white text-[#22333B]'}`}
                >
                  <option value="available 24/7">available 24/7</option>
                  <option value="Not available">Not available</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6" style={{ boxShadow: '0px 1px 2px 0px #0000000D' }}>
            <h3 className="text-[16px] font-bold text-[#22333B] mb-5">Specializations</h3>
            {isEditing ? (
              <input 
                type="text" 
                value={specializations} 
                onChange={(e) => setSpecializations(e.target.value)}
                placeholder="Comma separated: Cardiology, Neurology..."
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]" 
              />
            ) : (
              <div className="flex flex-wrap gap-3">
                {specializations.split(',').filter(Boolean).map((spec, i) => (
                  <div key={i} className="px-4 py-2 bg-[#B0B0B01A] border border-[#D6D6D633] text-[#9A9A9A] rounded-lg text-sm font-medium">
                    {spec.trim()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Doctors */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6" style={{ boxShadow: '0px 1px 2px 0px #0000000D' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#22333B]">Available Doctors</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input 
                type="text" 
                placeholder="Search doctor..." 
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm w-65 focus:outline-none focus:border-[#F68E5F]"
              />
            </div>
            {isEditing && (
              <button 
                onClick={() => setIsDoctorModalOpen(true)}
                className="flex justify-center items-center gap-1.5 px-4 py-2 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-sm font-medium hover:bg-[#ff6e2b] transition-colors whitespace-nowrap"
              >
                <Plus size={16} /> Add Doctor
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc, idx) => (
              <div key={idx} className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-lg bg-[#E2E8F0] overflow-hidden shrink-0 mt-1">
                  {/* Display uploaded local image or fallback to mock representation */}
                  {doc.image && doc.image.startsWith('data:image') ? (
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                  ) : doc.image === 'female' ? (
                    <img src="https://i.pravatar.cc/150?img=5" alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://i.pravatar.cc/150?img=11" alt={doc.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-[#22333B] mb-0.5">{doc.name}</h4>
                  <p className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase mb-3">{doc.specialty}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {doc.days.join(doc.days.length <= 3 ? ' - ' : ', ')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {doc.timeFrom} - {doc.timeTo}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8 text-[#6B7280] text-sm font-medium border border-dashed border-gray-300 rounded-xl">
              No doctors found. Try adjusting your search.
            </div>
          )}
        </div>
      </div>

      <AddDoctorModal 
        isOpen={isDoctorModalOpen} 
        onClose={() => setIsDoctorModalOpen(false)} 
        onAdd={handleAddDoctor} 
      />
    </div>
  );
};

export default PartnerDetails;
