import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatISODate(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

function formatDisplay(iso) {
  // iso: YYYY-MM-DD
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  if (!y || !m || !d) return "";
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

function parseISOToDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d, delta) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDaysGrid(viewDate) {
  const first = startOfMonth(viewDate);
  const firstDayOfWeek = first.getDay(); // 0=Sun
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - firstDayOfWeek);

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    days.push(day);
  }
  return days;
}

export default function ThemedDatePicker({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
  inputClassName = "",
  disabled = false,
  clearable = true,
  align = "auto",
  "aria-label": ariaLabel,
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);

  const selectedDate = useMemo(() => parseISOToDate(value), [value]);
  const [viewDate, setViewDate] = useState(
    () => selectedDate || new Date(),
  );

  useEffect(() => {
    if (selectedDate) setViewDate(startOfMonth(selectedDate));
  }, [value]);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    }

    function onDocKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, []);

  const days = useMemo(() => getDaysGrid(viewDate), [viewDate]);
  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(viewDate);
  }, [viewDate]);

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();

  const handleSelect = (day) => {
    if (disabled) return;
    const iso = formatISODate(day);
    onChange?.(iso);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onChange?.("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}> 
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          const next = !open;
          if (next && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const popoverWidth = 320;
            const margin = 16;
            const wouldOverflowRight = rect.left + popoverWidth > window.innerWidth - margin;
            const shouldAlignRight =
              align === "right" ? true : align === "left" ? false : wouldOverflowRight;
            setAlignRight(shouldAlignRight);
          }
          setOpen(next);
        }}
        className={`w-full sm:w-auto px-4 py-2.5 text-[16px] border border-[#E5E7EB] bg-white rounded-full text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F] flex items-center justify-between gap-3 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${inputClassName}`}
        aria-label={ariaLabel || "Select date"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={`${value ? "text-[#22333B]" : "text-[#9CA3AF]"} whitespace-nowrap`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClear(e);
              }}
              className="p-1 rounded-full hover:bg-orange-50"
              aria-label="Clear date"
            >
              <X size={16} className="text-[#6B7280]" />
            </span>
          )}
          <CalendarDays size={18} className="text-[#6B7280]" />
        </span>
      </button>

      {open && !disabled && (
        <div
          role="dialog"
          aria-label="Calendar"
          className={`absolute top-[calc(100%+8px)] z-50 w-[320px] max-w-[calc(100vw-2rem)] bg-white border border-[#E5E7EB] rounded-2xl shadow-lg p-3 ${alignRight ? "right-0" : "left-0"}`}
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <div className="text-sm font-semibold text-[#22333B]">
              {monthLabel}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewDate((d) => addMonths(d, -1))}
                className="px-2 py-1 rounded-lg hover:bg-orange-50 text-[#22333B]"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setViewDate((d) => addMonths(d, 1))}
                className="px-2 py-1 rounded-lg hover:bg-orange-50 text-[#22333B]"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 px-1 pb-1 text-[12px] text-[#6B7280]">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
              <div key={d} className="text-center py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 px-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isToday = isSameDay(day, new Date());

              const base =
                "w-10 h-10 rounded-xl text-sm flex items-center justify-center transition-colors";
              const textColor = inMonth ? "text-[#22333B]" : "text-[#9CA3AF]";
              const todayRing = isToday && !isSelected ? "ring-1 ring-[#F68E5F]" : "";
              const selected = isSelected
                ? "bg-[#F68E5F] text-[#FFFCFB]"
                : "hover:bg-orange-50";

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`${base} ${textColor} ${selected} ${todayRing}`}
                  aria-label={`${day.getDate()}-${day.getMonth() + 1}-${day.getFullYear()}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 px-1">
            <button
              type="button"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
              className="text-sm text-[#F68E5F] hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                onChange?.(formatISODate(new Date()));
                setOpen(false);
              }}
              className="text-sm text-[#F68E5F] hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
