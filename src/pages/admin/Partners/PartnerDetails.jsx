import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Plus, X, Trash2 } from 'lucide-react';
import apiService from '../../../api/service';

const AddDoctorModal = ({ isOpen, onClose, onAdd, saving }) => {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    timeFrom: "",
    timeTo: "",
    location: "",
    days: [],
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const daysList = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayLabels = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
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
    setFormData({ name: '', specialty: '', timeFrom: '', timeTo: '', location: '', days: [] });
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

        <div className="p-6 space-y-4">
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

const PartnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(location.state?.editMode || false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Load data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [details, setDetails] = useState({});
  const [specializations, setSpecializations] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');

  const [saving, setSaving] = useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [orgRes, docsRes] = await Promise.all([
        apiService.getOrganizationById(id),
        apiService.getDoctors(id)
      ]);
      let orgData = orgRes || {};
      if (orgRes?.data?.organization) {
        orgData = orgRes.data.organization;
      } else if (orgRes?.data) {
        orgData = orgRes.data;
      }
      setData(orgData);

      setDetails({
        registrationNumber: orgData.registrationId || '',
        partnerId: orgData.partnerId || '',
        establishmentYear: orgData.establishedYear || '',
        bedCapacity: orgData.bed || '',
        staffCount: orgData.staff || '',
        ambulanceService: orgData.ambulance || '',
        emergencyServices: orgData.emergency || 'available 24/7'
      });
      // Mocking specializations since it wasn't in original API fields
      setSpecializations(orgData.specializations?.join(', ') || 'Cardiology, Neurology');

      let docsData = [];
      if (Array.isArray(docsRes)) {
        docsData = docsRes;
      } else if (docsRes?.data?.doctors && Array.isArray(docsRes.data.doctors)) {
        docsData = docsRes.data.doctors;
      } else if (docsRes?.data && Array.isArray(docsRes.data)) {
        docsData = docsRes.data;
      } else if (docsRes?.doctors && Array.isArray(docsRes.doctors)) {
        docsData = docsRes.doctors;
      }
      setDoctors(docsData.filter(d =>
        d.organizationId === id ||
        d.organizationId?._id === id ||
        d.organizationId?.id === id
      ));
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredDoctors = doctors.filter(doc =>
    (doc.name || '').toLowerCase().includes(doctorSearch.toLowerCase()) ||
    (doc.specialty || '').toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        registrationId: details.registrationNumber,
        partnerId: details.partnerId,
        establishedYear: details.establishmentYear,
        bed: Number(details.bedCapacity) || undefined,
        staff: Number(details.staffCount) || undefined,
        ambulance: details.ambulanceService,
        emergency: details.emergencyServices
      };
      await apiService.updateOrganization(id, payload);

      setIsEditing(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update partner details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = async (doctor) => {
    try {
      setSaving(true);
      const docPayload = {
        name: doctor.name,
        specialty: doctor.specialty,
        timeFrom: doctor.timeFrom,
        timeTo: doctor.timeTo,
        location: doctor.location || 'Unknown',
        organizationId: id,
        days: doctor.days,
        image: doctor.image
      };
      await apiService.createDoctor(docPayload);
      fetchData(); // refresh doctors list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add doctor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoctor = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await apiService.deleteDoctor(docId);
      setDoctors(prev => prev.filter(d => (d._id || d.id) !== docId));
    } catch {
      alert('Failed to remove doctor.');
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="p-10 text-center text-gray-500">Partner Details Not Found</div>;

  return (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/partners")}
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
                disabled={saving}
                className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff702d] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff6e2b] flex items-center gap-2 transition-colors"
            >
              Edit
              <img
                src="/admin_images/Edit 3.svg"
                alt=""
                className="w-3.5 h-3.5"
              />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Left Side Profile Card */}
        <div className="w-full lg:w-[320px] shrink-0 ">
          <div
            className="bg-white border border-[#E5E7EB] rounded-2xl p-8 flex flex-col items-center h-full justify-between shadow-sm"
          >
            <div className="flex flex-col items-center pt-4">
              <div className="w-24 h-24 rounded-full bg-[#94A3B8] text-[#FFFCFB] flex items-center justify-center text-3xl font-serif mb-4 shadow-inner">
                {(data.name || data.orgName)?.split(' ').map(n => n[0]).join('').substring(0, 3)}
              </div>
              <h3 className="text-2xl font-bold text-[#22333B] text-center mb-3 font-serif leading-tight">
                {data.name || data.orgName}
              </h3>
              <div className="px-4 py-1 bg-[#F8FAFC] text-[#4B5563] rounded-full text-sm font-medium flex items-center gap-1.5 mb-8">
                <img src="/admin_images/partner.svg" alt="" className="w-3.5 h-3.5" />
                {data.type || 'Hospital'}
              </div>
              <div className="flex justify-between w-full border-t border-[#E5E7EB] pt-6 mt-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#9A9A9A]">{data.rating || '0.0'}</p>
                  <p className="text-[12px] font-semibold text-[#9A9A9A] tracking-widest uppercase mt-1">RATING</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#9A9A9A]">{data.members || '0'}</p>
                  <p className="text-[12px] font-semibold text-[#9A9A9A] tracking-widest uppercase mt-1">MEMBERS</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Organization Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
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
                <label className="block text-sm text-[#374151] mb-1.5">Staff Count</label>
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
                <label className="block text-sm text-[#374151] mb-1.5">Emergency Services</label>
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
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
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
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6 shadow-sm">
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
                  {doc.image && doc.image.startsWith('data:image') ? (
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                  ) : doc.image === 'female' ? (
                    <img src="https://i.pravatar.cc/150?img=5" alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://i.pravatar.cc/150?img=11" alt={doc.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[15px] font-bold text-[#22333B] mb-0.5 truncate">{doc.name}</h4>
                    {isEditing && (
                      <button onClick={() => handleDeleteDoctor(doc._id || doc.id)} className="text-[#9CA3AF] hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase mb-3">{doc.specialty}</p>

                  <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <span className="truncate">{Array.isArray(doc.days) ? doc.days.join(doc.days.length <= 3 ? ' - ' : ', ') : ''}</span>
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
              No doctors found. Try adjusting your search.
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

export default PartnerDetails;
