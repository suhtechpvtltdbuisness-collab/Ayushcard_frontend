import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ── Context ────────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerMap = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timerMap.current[id]);
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
      timerMap.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toastSuccess = useCallback((msg, d) => toast(msg, "success", d), [toast]);
  const toastError   = useCallback((msg, d) => toast(msg, "error",   d), [toast]);
  const toastWarn    = useCallback((msg, d) => toast(msg, "warn",    d), [toast]);
  const toastInfo    = useCallback((msg, d) => toast(msg, "info",    d), [toast]);

  return (
    <ToastContext.Provider value={{ toast, toastSuccess, toastError, toastWarn, toastInfo, dismiss }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
        style={{ fontFamily: "Inter, sans-serif", maxWidth: "380px" }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ── Individual Toast ────────────────────────────────────────────────────────────
const CONFIG = {
  success: {
    icon: <CheckCircle size={18} />,
    bg: "bg-[#ECFDF5]",
    border: "border-[#10B981]",
    text: "text-[#065F46]",
    icon_color: "text-[#10B981]",
  },
  error: {
    icon: <XCircle size={18} />,
    bg: "bg-[#FEF2F2]",
    border: "border-[#F87171]",
    text: "text-[#991B1B]",
    icon_color: "text-[#EF4444]",
  },
  warn: {
    icon: <AlertTriangle size={18} />,
    bg: "bg-[#FFFBEB]",
    border: "border-[#F59E0B]",
    text: "text-[#92400E]",
    icon_color: "text-[#F59E0B]",
  },
  info: {
    icon: <Info size={18} />,
    bg: "bg-[#EFF6FF]",
    border: "border-[#60A5FA]",
    text: "text-[#1E40AF]",
    icon_color: "text-[#3B82F6]",
  },
};

const ToastItem = ({ toast: t, onDismiss }) => {
  const c = CONFIG[t.type] || CONFIG.info;
  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 w-full max-w-sm
        px-4 py-3 rounded-xl border shadow-lg
        transition-all duration-300 ease-out
        ${c.bg} ${c.border} ${c.text}
        ${t.leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
      `}
    >
      <span className={`shrink-0 mt-0.5 ${c.icon_color}`}>{c.icon}</span>
      <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
      <button
        onClick={() => onDismiss(t.id)}
        className={`shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity ${c.text}`}
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

export default ToastProvider;
