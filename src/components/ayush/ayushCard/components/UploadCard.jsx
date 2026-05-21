/** Shared shell for Step 1 upload / scan columns — equal height and styling. */
export function UploadCard({ title, subtitle, children, highlighted = false }) {
  return (
    <div
      className={`flex flex-col items-center w-full min-h-[232px] p-3 sm:p-4 rounded-xl bg-[#faf3e1] border ${
        highlighted ? "border-2 border-[#fa8112]" : "border border-[#fa8112]/30"
      } shadow-sm`}
    >
      <h4 className="w-full text-[11px] sm:text-[12px] font-bold text-[#222222] text-center leading-tight">
        {title}
      </h4>
      {subtitle ? (
        <p className="w-full text-[10px] text-gray-500 text-center mt-0.5 mb-2 px-1 leading-snug">
          {subtitle}
        </p>
      ) : (
        <div className="mb-2" />
      )}
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-[240px] mx-auto">
        {children}
      </div>
    </div>
  );
}

export function UploadCardActions({ children, className = "" }) {
  return (
    <div className={`flex gap-2 w-full max-w-[240px] mx-auto mt-2 ${className}`}>
      {children}
    </div>
  );
}

export function UploadIdleBox({ children, className = "" }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full min-h-[140px] rounded-lg ${className}`}
    >
      {children}
    </div>
  );
}
