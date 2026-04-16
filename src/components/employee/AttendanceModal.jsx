import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, MapPin, Tent, ChevronRight, X, Loader2 } from "lucide-react";
import apiService from "../../api/service";
import { useAttendance } from "../../context/AttendanceContext";

const STEPS = { CAMP: 1, LOCATION: 2, SUCCESS: 3 };

const AttendanceModal = () => {
  const { showModal, closeModal, markSuccessful } = useAttendance();

  const [step, setStep] = useState(STEPS.CAMP);
  const [camps, setCamps] = useState([]);
  const [loadingCamps, setLoadingCamps] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Reset state whenever modal opens
  useEffect(() => {
    if (showModal) {
      setStep(STEPS.CAMP);
      setSelectedCamp(null);
      setLocation(null);
      setLocationError("");
      setSubmitError("");
      fetchCamps();
    }
  }, [showModal]);

  const fetchCamps = async () => {
    try {
      setLoadingCamps(true);
      const res = await apiService.getCamps({ limit: 100 });
      const raw = Array.isArray(res?.data?.camps)
        ? res.data.camps
        : Array.isArray(res?.data)
          ? res.data
          : [];
      // Only show future/today camps
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setCamps(raw.filter(c => !c.isDeleted));
    } catch (err) {
      console.error("Failed to load camps", err);
    } finally {
      setLoadingCamps(false);
    }
  };

  const handleSelectCamp = (camp) => {
    setSelectedCamp(camp);
  };

  const handleProceedToLocation = () => {
    if (!selectedCamp) return;
    setStep(STEPS.LOCATION);
    fetchLocation();
  };

  const fetchLocation = useCallback(() => {
    setLocating(true);
    setLocationError("");
    setLocation(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const long = pos.coords.longitude;

        let city = "";
        let state = "";
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await r.json();
          const addr = data?.address || {};
          city = addr.city || addr.town || addr.village || addr.county || addr.district || "";
          state = addr.state || "";
        } catch (_) {
          // city/state optional
        }
        setLocation({ lat, long: long, city, state });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied. Please allow access in your browser settings.");
        } else {
          setLocationError("Unable to retrieve your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  const handleMarkAttendance = async () => {
    if (!selectedCamp || !location) return;
    try {
      setSubmitting(true);
      setSubmitError("");
      await apiService.markAttendance({
        campId: selectedCamp._id,
        currentLat: location.lat,
        currentLong: location.long,
      });
      setStep(STEPS.SUCCESS);
      setTimeout(() => {
        markSuccessful(selectedCamp._id, selectedCamp.name);
      }, 1800);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to mark attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F68E5F] to-[#ff7535] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-bold">Mark Attendance</h2>
            <p className="text-orange-100 text-xs mt-0.5">
              {step === STEPS.CAMP && "Select today's camp"}
              {step === STEPS.LOCATION && "Confirm your location"}
              {step === STEPS.SUCCESS && "Attendance recorded!"}
            </p>
          </div>
          {step !== STEPS.SUCCESS && (
            <button
              onClick={closeModal}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {step !== STEPS.SUCCESS && (
          <div className="flex items-center px-6 py-3 gap-2 bg-orange-50 border-b border-orange-100">
            {[STEPS.CAMP, STEPS.LOCATION].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= s ? "text-[#F68E5F]" : "text-gray-400"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${step >= s ? "border-[#F68E5F] text-[#F68E5F] bg-orange-50" : "border-gray-300 text-gray-400"}`}>{s}</span>
                  {s === STEPS.CAMP ? "Select Camp" : "Confirm Location"}
                </div>
                {i === 0 && <div className={`flex-1 h-px ${step >= STEPS.LOCATION ? "bg-[#F68E5F]" : "bg-gray-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">

          {/* STEP 1: Camp Selection */}
          {step === STEPS.CAMP && (
            <div>
              <p className="text-sm text-gray-500 mb-3">Which camp are you working at today?</p>
              {loadingCamps ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="text-[#F68E5F] animate-spin" />
                </div>
              ) : camps.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No camps available.</div>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {camps.map((camp) => (
                    <button
                      key={camp._id}
                      onClick={() => handleSelectCamp(camp)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        selectedCamp?._id === camp._id
                          ? "border-[#F68E5F] bg-orange-50"
                          : "border-gray-100 hover:border-orange-200 hover:bg-orange-50/50"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${selectedCamp?._id === camp._id ? "bg-[#F68E5F]" : "bg-gray-100"}`}>
                        <Tent size={16} className={selectedCamp?._id === camp._id ? "text-white" : "text-gray-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selectedCamp?._id === camp._id ? "text-[#F68E5F]" : "text-[#22333B]"}`}>{camp.name}</p>
                        <p className="text-xs text-gray-400 truncate">{camp.city}, {camp.state} · {new Date(camp.date).toLocaleDateString()}</p>
                      </div>
                      {selectedCamp?._id === camp._id && (
                        <CheckCircle size={18} className="text-[#F68E5F] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-5 gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleProceedToLocation}
                  disabled={!selectedCamp}
                  className="px-5 py-2 bg-[#F68E5F] text-white text-sm font-medium rounded-lg hover:bg-[#ff7535] disabled:opacity-40 flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location Confirmation */}
          {step === STEPS.LOCATION && (
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <Tent size={18} className="text-[#F68E5F] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#22333B]">{selectedCamp?.name}</p>
                  <p className="text-xs text-gray-400">{selectedCamp?.city}, {selectedCamp?.state}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">Your current location will be recorded for attendance.</p>

              {locating && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <MapPin size={24} className="text-[#F68E5F] animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-500">Detecting your location...</p>
                </div>
              )}

              {locationError && !locating && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center mb-4">
                  <p className="text-sm text-red-600 mb-3">{locationError}</p>
                  <button
                    onClick={fetchLocation}
                    className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                  >
                    Retry
                  </button>
                </div>
              )}

              {location && !locating && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Location Detected</span>
                  </div>
                  <p className="text-xs text-green-600 font-mono">Lat: {location.lat.toFixed(6)}  Long: {location.long.toFixed(6)}</p>
                  {location.city && (
                    <p className="text-xs text-green-600 mt-1">{location.city}{location.state ? `, ${location.state}` : ""}</p>
                  )}
                </div>
              )}

              {submitError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">{submitError}</p>
              )}

              <div className="flex justify-between mt-4 gap-3">
                <button
                  onClick={() => setStep(STEPS.CAMP)}
                  className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleMarkAttendance}
                  disabled={!location || locating || submitting}
                  className="px-5 py-2 bg-[#F68E5F] text-white text-sm font-medium rounded-lg hover:bg-[#ff7535] disabled:opacity-40 flex items-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Marking...</>
                  ) : (
                    <><CheckCircle size={16} /> Mark Attendance</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === STEPS.SUCCESS && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-[#22333B] mb-1">Attendance Marked!</h3>
              <p className="text-sm text-gray-500 mb-1">You're checked in at</p>
              <p className="text-sm font-semibold text-[#F68E5F]">{selectedCamp?.name}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs text-gray-400 mt-4">This window will close automatically...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
