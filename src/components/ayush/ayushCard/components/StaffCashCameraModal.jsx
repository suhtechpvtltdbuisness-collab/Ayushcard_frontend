import { Camera, X } from "lucide-react";
import { useAyushCardForm } from "../AyushCardFormContext.jsx";

export default function StaffCashCameraModal() {
  const {
    staffCashCameraActive,
    staffCashVideoRef,
    stopStaffCashCamera,
    captureStaffCashReceipt,
  } = useAyushCardForm();

  if (!staffCashCameraActive) return null;

  return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={stopStaffCashCamera}
              />
              <div className="relative w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="text-xl font-bold text-[#222222]">Capture Cash Receipt</h3>
                    <p className="text-sm text-gray-500">Align the receipt within the frame</p>
                  </div>
                  <button 
                    onClick={stopStaffCashCamera}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Camera Container */}
                <div className="relative aspect-[4/3] bg-black">
                  <video
                    ref={staffCashVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Decorative corner borders */}
                  <div className="absolute inset-8 border-2 border-white/30 rounded-2xl pointer-events-none">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#fa8112] rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#fa8112] rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#fa8112] rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#fa8112] rounded-br-lg" />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 flex gap-3">
                  <button
                    type="button"
                    onClick={stopStaffCashCamera}
                    className="flex-1 px-6 py-4 border border-gray-200 bg-white rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={captureStaffCashReceipt}
                    className="flex-[2] bg-[#fa8112] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#e0720f] transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    Capture Photo
                  </button>
                </div>
              </div>
            </div>
  );
}
