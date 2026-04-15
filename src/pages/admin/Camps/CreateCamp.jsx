import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import apiService from '../../../api/service';
import { useToast } from '../../../components/ui/Toast';

const CreateCamp = ({ basePath = "/admin" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toastSuccess, toastError } = useToast();
  
  const isEditMode = Boolean(id) && location.state?.editMode;

  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    long: '',
    city: '',
    state: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchCampDetails();
    }
  }, [id, isEditMode]);

  const fetchCampDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCampById(id);
      const data = res?.data || res;
      if (data) {
        setFormData({
          name: data.name || '',
          lat: data.lat || '',
          long: data.long || '',
          city: data.city || '',
          state: data.state || '',
          date: data.date ? new Date(data.date).toISOString().slice(0, 10) : ''
        });
      }
    } catch (error) {
      toastError("Failed to fetch camp details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toastError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        // Update lat/long immediately
        setFormData((prev) => ({
          ...prev,
          lat: lat.toFixed(6),
          long: long.toFixed(6),
        }));

        // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          const addr = data?.address || {};

          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.county ||
            addr.district ||
            '';
          const state = addr.state || '';

          setFormData((prev) => ({
            ...prev,
            city,
            state,
          }));
          toastSuccess("Location fetched successfully!");
        } catch (err) {
          toastError("Could not fetch city/state. Please enter manually.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toastError("Location permission denied. Please allow access and try again.");
        } else {
          toastError("Unable to retrieve your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const payload = {
        ...formData,
        lat: parseFloat(formData.lat) || 0,
        long: parseFloat(formData.long) || 0
      };

      if (isEditMode) {
        await apiService.updateCamp(id, payload);
        toastSuccess("Camp updated successfully!");
      } else {
        await apiService.createCamp(payload);
        toastSuccess("Camp created successfully!");
      }
      navigate(`${basePath}/camps`);
    } catch (error) {
      toastError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} camp.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`${basePath}/camps`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-[#22333B]" />
        </button>
        <h2 className="text-xl font-bold text-[#22333B]">{isEditMode ? 'Edit Camp' : 'Add New Camp'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-1 bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 mb-6">
        {/* Section header + Current Location button */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-6">
          <h3 className="text-[18px] font-semibold text-[#22333B]">Camp Details</h3>
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={locating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#F68E5F] text-[#F68E5F] text-sm font-medium hover:bg-[#FFF4EF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {locating ? (
              <>
                <span className="w-4 h-4 border-2 border-[#F68E5F] border-t-transparent rounded-full animate-spin shrink-0" />
                Locating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Use Current Location
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">Camp Name <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#F68E5F]"
              placeholder="Enter camp name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">Date <span className="text-red-500">*</span></label>
            <input
              required
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#F68E5F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">City <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#F68E5F]"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">State <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#F68E5F]"
              placeholder="Enter state"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#F68E5F]"
              placeholder="E.g. 19.076"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              name="long"
              value={formData.long}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#F68E5F]"
              placeholder="E.g. 72.8777"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/camps`)}
            className="px-6 py-2 border border-[#E5E7EB] text-[#4B5563] font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#F68E5F] text-white font-medium rounded-lg hover:bg-[#ff7535] flex items-center justify-center gap-2 disabled:opacity-50 min-w-[120px]"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (
              <>
                <Save size={18} />
                Save Camp
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCamp;
