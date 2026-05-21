import { Loader2 } from "lucide-react";

/** ISO ID-1 card ratio — matches OCR crop in imageOptimizer.js */
export const AADHAAR_CARD_ASPECT = 1.586;

export default function AadhaarScanOverlay({
  active,
  progress = 0,
  statusMessage = "Scanning…",
}) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 p-3 animate-in fade-in duration-200">
      <Loader2 className="animate-spin text-[#fa8112] mb-2" size={22} aria-hidden />
      <div className="w-full max-w-[140px] h-1 bg-white/25 rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full bg-[#fa8112] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
        />
      </div>
      <p className="text-white text-[10px] font-semibold text-center px-2 leading-tight">
        {statusMessage}
      </p>
    </div>
  );
}

function CornerBracket({ className = "" }) {
  return (
    <span
      className={`absolute w-3.5 h-3.5 border-[#fa8112] pointer-events-none ${className}`}
      aria-hidden
    />
  );
}

/**
 * Compact KYC scanner — fits equal-width upload cards on Step 1.
 */
export function AadhaarCameraScanner({ videoRef, hint, children }) {
  return (
    <div className="w-full max-w-[220px] mx-auto">
      <div
        className="aadhaar-scanner-viewport @container relative w-full overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-zinc-700/50 aspect-[4/3] max-h-[148px]"
        role="region"
        aria-label="Aadhaar scan preview"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div
          className="absolute inset-0 z-[1] flex items-center justify-center p-2 pointer-events-none"
          aria-hidden
        >
          <div
            className="relative mx-auto w-[min(88cqw,100%)] max-h-[68cqh] aspect-[1.586/1] h-auto shrink-0 overflow-hidden rounded-[6px] border border-dashed border-[#fa8112]/95 shadow-[0_0_0_100vmax_rgba(0,0,0,0.48)]"
          >
            <CornerBracket className="top-0 left-0 border-t-2 border-l-2 rounded-tl-sm" />
            <CornerBracket className="top-0 right-0 border-t-2 border-r-2 rounded-tr-sm" />
            <CornerBracket className="bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm" />
            <CornerBracket className="bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm" />
            <div className="absolute inset-x-0 top-0 h-px bg-[#fa8112]/80 animate-[aadhaarScanLine_2.4s_ease-in-out_infinite]" />
          </div>
        </div>

        {children}
      </div>

      {hint ? (
        <p className="text-[9px] text-gray-500 text-center mt-1.5 px-0.5 leading-snug line-clamp-2">
          {hint}
        </p>
      ) : null}

      <style>{`
        @keyframes aadhaarScanLine {
          0%, 100% { top: 8%; opacity: 0.35; }
          50% { top: 86%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
