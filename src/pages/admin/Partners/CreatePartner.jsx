import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, X, Upload, Camera } from 'lucide-react';
import apiService from '../../../api/service';
import { useToast } from '../../../components/ui/Toast';

const AddDoctorModal = ({ isOpen, onClose, onAdd, saving }) => {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    timeFrom: "",
    timeTo: "",
    location: "",
    days: [],
    image: null,
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = React.useRef(null);

  if (!isOpen) return null;

  const daysList = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayLabels = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.specialty.trim()) e.specialty = 'Specialty is required';
    if (!formData.timeFrom) e.timeFrom = 'Start time required';
    if (!formData.timeTo) e.timeTo = 'End time required';
    if (!formData.location.trim()) e.location = 'Location is required';
    if (formData.days.length === 0) e.days = 'Select at least one day';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;
    onAdd({ ...formData });
    setFormData({ name: '', specialty: '', timeFrom: '', timeTo: '', location: '', days: [], image: null });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-[#22333B]">Add Doctor</h3>
            <p className="text-sm text-[#6B7280]">Fill in the doctor details below</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9CA3AF] hover:text-[#22333B] transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Circular Image Upload */}
          <div className="flex flex-col items-center mb-2">
            <div
              className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden cursor-pointer hover:border-[#F68E5F] hover:text-[#F68E5F] transition-all relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.image ? (
                <>
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera size={24} />
                  <span className="text-[10px] mt-1">Upload</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#22333B] mb-1.5">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Smith"
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F] ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#22333B] mb-1.5">Specialty <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Cardiology"
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F] ${errors.specialty ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.specialty && <p className="text-xs text-red-500 mt-1">{errors.specialty}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#22333B] mb-1.5">Timing <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={formData.timeFrom}
                onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F] ${errors.timeFrom ? 'border-red-400' : 'border-gray-200'}`}
              />
              <span className="text-sm text-gray-500">To</span>
              <input
                type="time"
                value={formData.timeTo}
                onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F] ${errors.timeTo ? 'border-red-400' : 'border-gray-200'}`}
              />
            </div>
            {(errors.timeFrom || errors.timeTo) && (
              <p className="text-xs text-red-500 mt-1">{errors.timeFrom || errors.timeTo}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#22333B] mb-1.5">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Building A, Floor 3"
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F68E5F] ${errors.location ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#22333B] mb-1.5">Days <span className="text-red-500">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {daysList.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`flex-1 min-w-[40px] py-1.5 rounded-md text-xs font-medium transition-colors border ${formData.days.includes(day)
                      ? 'bg-[#F68E5F] border-[#ff6e2b] text-[#FFFCFB]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {dayLabels[day]}
                </button>
              ))}
            </div>
            {errors.days && <p className="text-xs text-red-500 mt-1">{errors.days}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#22333B] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-sm font-medium hover:bg-[#ff6e2b] transition-colors disabled:opacity-60"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreatePartner = () => {
  const navigate = useNavigate();
  const { toastWarn } = useToast();
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form States
  const [basicInfo, setBasicInfo] = useState({
    orgName: "",
    type: "Hospital",
    primaryContact: "",
    location: "",
    image: null,
  });
  const basicInfoImageRef = React.useRef(null);

  const [details, setDetails] = useState({
    registrationNumber: "",
    partnerId: "",
    establishmentYear: "",
    bedCapacity: "",
    staffCount: "",
    ambulanceService: "",
    emergencyServices: "available 24/7",
  });

  const [specializations, setSpecializations] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState("");

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleBasicInfoChange = (e) => {
    let { name, value } = e.target;
    if (name === "primaryContact") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleBasicInfoImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBasicInfo((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDoctor = (doctor) => {
    setDoctors([...doctors, doctor]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg('');

      const payload = {
        name: basicInfo.orgName || 'Unnamed Partner',
        type: basicInfo.type || 'Hospital',
        contact: basicInfo.primaryContact || '',
        location: basicInfo.location || '',
        registrationId: details.registrationNumber || '',
        partnerId: details.partnerId || '',
        establishedYear: details.establishmentYear || '',
        bed: Number(details.bedCapacity) || undefined,
        logo: basicInfo.image || undefined,
        staff: Number(details.staffCount) || undefined,
        ambulance: details.ambulanceService || undefined,
        emergency: details.emergencyServices || undefined,
      };

      // Remove undefined
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      console.log('Creating organization with payload:', payload);
      const orgRes = await apiService.createOrganization(payload);
      console.log('Organization creation response:', orgRes);

      const orgId = orgRes?._id ||
        orgRes?.data?._id ||
        orgRes?.data?.organization?._id ||
        orgRes?.organization?._id ||
        orgRes?.id ||
        orgRes?.data?.id ||
        (typeof orgRes?.data === 'string' ? orgRes.data : null) ||
        (typeof orgRes?.organization === 'string' ? orgRes.organization : null);

      console.log('Final resolved orgId for doctors:', orgId);

      if (!orgId) {
        toastWarn("Organization created, but couldn't find the ID in response.");
        return;
      }

      if (orgId && doctors.length > 0) {
        console.log(`Sending ${doctors.length} doctors to /api/doctors/ ...`);
        const doctorResults = await Promise.all(
          doctors.map(doc => {
            const docPayload = {
              name: doc.name,
              specialty: doc.specialty,
              timeFrom: doc.timeFrom,
              timeTo: doc.timeTo,
              location: doc.location || 'Unknown',
              organizationId: orgId,
              days: doc.days,
              image: doc.image,
            };
            console.log('Hitting /api/doctors/ POST with:', docPayload);
            return apiService.createDoctor(docPayload);
          })
        );
        console.log('Doctors successfully created:', doctorResults);
      } else {
        console.warn('Doctor creation SKIPPED: no doctors added.');
      }

      navigate('/admin/partners');
    } catch (err) {
      console.error('Error in handleSave:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to successfully save the partner.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto pb-10"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/admin/partners')}
            className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#4B5563] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#22333B]">Add New Partner</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/admin/partners')}
            className="flex-1 sm:flex-none px-6 py-2 border border-gray-200 rounded-lg text-[15px] font-medium text-[#374151] hover:bg-gray-50 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff702d] transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Partner'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Left Side Profile Card (Basic Info during creation) */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col shadow-[0_4px_20px_0px_#0000000D] h-full">
            <h3 className="text-[16px] font-bold text-[#22333B] mb-5">
              Basic Info
            </h3>
            <div className="relative mb-6 self-center">
              <div
                className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 overflow-hidden cursor-pointer"
                onClick={() => basicInfoImageRef.current?.click()}
              >
                {basicInfo.image ? (
                  <img
                    src={basicInfo.image}
                    alt="Hospital Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#F68E5F] shadow-sm"
                onClick={() => basicInfoImageRef.current?.click()}
              >
                <Camera size={14} />
              </button>
              <input
                type="file"
                ref={basicInfoImageRef}
                onChange={handleBasicInfoImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Organization Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="orgName"
                  value={basicInfo.orgName}
                  onChange={handleBasicInfoChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. Care Hospital"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Type</label>
                <select
                  name="type"
                  value={basicInfo.type}
                  onChange={handleBasicInfoChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                >
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Pathology Lab">Pathology Lab</option>
                  <option value="Nursing Home">Nursing Home</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Primary Contact</label>
                <input
                  type="text"
                  name="primaryContact"
                  value={basicInfo.primaryContact}
                  onChange={handleBasicInfoChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  value={basicInfo.location}
                  onChange={handleBasicInfoChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. Kanpur, UP"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Organization Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_4px_20px_0px_#0000000D]">
            <h3 className="text-[16px] font-bold text-[#22333B] mb-5">
              Organization Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={details.registrationNumber}
                  onChange={handleDetailChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. HOSP/2020/001"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Partner ID</label>
                <input
                  type="text"
                  name="partnerId"
                  value={details.partnerId}
                  onChange={handleDetailChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. PTE-001"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Establishment Year</label>
                <input
                  type="date"
                  name="establishmentYear"
                  value={details.establishmentYear}
                  onChange={handleDetailChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Bed Capacity</label>
                <input
                  type="number"
                  name="bedCapacity"
                  value={details.bedCapacity}
                  onChange={handleDetailChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. 1200"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Staff Count</label>
                <input
                  type="number"
                  name="staffCount"
                  value={details.staffCount}
                  onChange={handleDetailChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. 420"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Ambulance Service</label>
                <input
                  type="text"
                  name="ambulanceService"
                  value={details.ambulanceService}
                  onChange={handleDetailChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                  placeholder="e.g. 5 Ambulances Available"
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1.5">Emergency Services</label>
                <select
                  name="emergencyServices"
                  value={details.emergencyServices}
                  onChange={handleDetailChange}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
                >
                  <option value="available 24/7">available 24/7</option>
                  <option value="Not available">Not available</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_4px_20px_0px_#0000000D]">
            <h3 className="text-[16px] font-bold text-[#22333B] mb-5">Specializations</h3>
            <input
              type="text"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
              placeholder="Comma separated: Cardiology, Neurology, Orthopedics..."
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#22333B] focus:outline-none focus:border-[#F68E5F]"
            />
          </div>
        </div>
      </div>

      {/* Available Doctors (Full Width) */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6 shadow-[0_4px_20px_0px_#0000000D]">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-[#22333B]">
            Available Doctors
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search doctor..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm w-full sm:w-80 focus:outline-none focus:border-[#F68E5F]"
              />
            </div>
            <button
              onClick={() => setIsDoctorModalOpen(true)}
              className="flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-sm font-medium hover:bg-[#ff702d] transition-colors whitespace-nowrap"
            >
              <Plus size={16} /> Add Doctor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 flex gap-4 items-start"
              >
                <div className="w-12 h-12 rounded-lg bg-[#E2E8F0] overflow-hidden shrink-0 mt-1">
                  {doc.image && doc.image.startsWith("data:image") ? (
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : doc.image === "female" ? (
                    <img
                      src="https://i.pravatar.cc/150?img=5"
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="https://i.pravatar.cc/150?img=11"
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[15px] font-bold text-[#22333B] mb-0.5">{doc.name}</h4>
                    <button
                      onClick={() => setDoctors(docs => docs.filter((_, i) => i !== idx))}
                      className="text-[#9CA3AF] hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase mb-3">{doc.specialty}</p>

                  <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    {doc.days.join(doc.days.length <= 3 ? ' - ' : ', ')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {doc.timeFrom} - {doc.timeTo}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8 text-[#6B7280] text-sm font-medium border border-dashed border-gray-300 rounded-xl">
              No doctors added yet. Try adding a new doctor.
            </div>
          )}
        </div>
      </div>

      <AddDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onAdd={handleAddDoctor}
        saving={saving}
      />
    </div>
  );
};

export default CreatePartner;
