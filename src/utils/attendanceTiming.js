/** Minutes worked below this (with check-out) counts as half day; at or above counts as full day. */
export const ATTENDANCE_FULL_DAY_MIN_MINUTES = 240;

export function parseTimeValue(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number" && !Number.isNaN(v)) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "object") {
    const inner = v.time ?? v.at ?? v.date ?? v.timestamp;
    if (inner != null) return parseTimeValue(inner);
  }
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function getCheckInDate(rec) {
  if (!rec) return null;
  return (
    parseTimeValue(rec.checkInTime) ||
    parseTimeValue(rec.checkIn) ||
    parseTimeValue(rec.checkinTime) ||
    parseTimeValue(rec.clockIn) ||
    parseTimeValue(rec.checkInAt) ||
    parseTimeValue(rec.date)
  );
}

export function getCheckOutDate(rec) {
  if (!rec) return null;
  return (
    parseTimeValue(rec.checkOutTime) ||
    parseTimeValue(rec.checkoutTime) ||
    parseTimeValue(rec.checkOut) ||
    parseTimeValue(rec.checkout) ||
    parseTimeValue(rec.clockOut) ||
    parseTimeValue(rec.checkOutAt) ||
    parseTimeValue(rec.checkoutAt)
  );
}

export function formatClock(d) {
  if (!d) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function getWorkingDurationMinutes(rec) {
  if (rec == null) return null;

  const fromFields =
    rec.workingMinutes ??
    rec.durationMinutes ??
    rec.workDurationMinutes ??
    (typeof rec.durationMins === "number" ? rec.durationMins : null);
  if (typeof fromFields === "number" && fromFields >= 0) return fromFields;

  if (typeof rec.totalHours === "number" && !Number.isNaN(rec.totalHours)) {
    return Math.round(rec.totalHours * 60);
  }

  const wh = rec.workingHours ?? rec.workHours ?? rec.workDuration;
  if (typeof wh === "number" && !Number.isNaN(wh)) return Math.round(wh * 60);
  if (typeof wh === "string" && wh.trim()) {
    const hMatch = wh.match(/(\d+)\s*h/i);
    const mMatch = wh.match(/(\d+)\s*m/i);
    const h = hMatch ? Number(hMatch[1]) : 0;
    const m = mMatch ? Number(mMatch[1]) : 0;
    if (h > 0 || m > 0) return h * 60 + m;
  }

  const inD = getCheckInDate(rec);
  const outD = getCheckOutDate(rec);
  if (inD && outD) {
    const ms = outD.getTime() - inD.getTime();
    if (ms > 0) return Math.floor(ms / 60000);
  }
  return null;
}

export function isHalfDayAttendance(rec) {
  if (!rec || !getCheckInDate(rec)) return false;

  const raw = String(rec.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (raw === "half_day" || raw === "halfday") return true;
  if (raw === "absent") return false;
  if (raw === "full_day" || raw === "fullday") return false;

  const out = getCheckOutDate(rec);
  if (!out) return false;

  const minutes = getWorkingDurationMinutes(rec);
  if (minutes == null || minutes <= 0) return false;

  return minutes < ATTENDANCE_FULL_DAY_MIN_MINUTES;
}

export function isFullDayAttendance(rec) {
  if (!rec || !getCheckInDate(rec)) return false;

  const raw = String(rec.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (raw === "absent") return false;
  if (raw === "half_day" || raw === "halfday") return false;
  if (raw === "full_day" || raw === "fullday") return true;

  const out = getCheckOutDate(rec);
  if (!out) return false;

  const minutes = getWorkingDurationMinutes(rec);
  if (minutes == null || minutes <= 0) return false;

  return minutes >= ATTENDANCE_FULL_DAY_MIN_MINUTES;
}

export function formatWorkingHours(rec) {
  if (rec == null) return "—";
  const wh =
    rec.workingHours ??
    rec.workHours ??
    rec.durationLabel ??
    rec.workDuration ??
    (typeof rec.totalHours === "number" ? `${rec.totalHours}h` : null);
  if (wh != null && wh !== "" && typeof wh !== "number") return String(wh);

  const mins = getWorkingDurationMinutes(rec);
  if (typeof mins === "number" && mins > 0) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  return "—";
}

export function getRowCalendarDate(rec) {
  const cin = getCheckInDate(rec);
  if (cin) return cin;
  if (rec?.date) {
    const d = new Date(rec.date);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export function getDisplayAttendanceStatus(rec) {
  const raw = String(rec?.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const out = getCheckOutDate(rec);
  const inn = getCheckInDate(rec);

  if (out) {
    if (raw === "absent") return "absent";
    if (raw === "half_day" || raw === "halfday") return "half_day";
    if (raw === "full_day" || raw === "fullday") return "full_day";
    if (isHalfDayAttendance(rec)) return "half_day";
    if (isFullDayAttendance(rec)) return "full_day";
    if (raw && raw !== "present" && raw !== "") return raw;
    return "completed";
  }
  if (inn) {
    if (raw === "late") return "late";
    if (raw === "absent") return "absent";
    if (raw === "half_day" || raw === "halfday") return "half_day";
    if (raw === "full_day" || raw === "fullday") return "full_day";
    if (raw && raw !== "present" && raw !== "") return raw;
    return "present";
  }
  return raw || "pending";
}

export function attendanceStatusClass(slug) {
  const key = String(slug || "pending").toLowerCase().replace(/\s+/g, "_");
  const map = {
    present: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-800",
    full_day: "bg-emerald-100 text-emerald-800",
    absent: "bg-red-100 text-red-700",
    late: "bg-yellow-100 text-yellow-700",
    half_day: "bg-amber-100 text-amber-800",
    pending: "bg-gray-100 text-gray-600",
  };
  return map[key] || "bg-gray-100 text-gray-600";
}

export function formatAttendanceStatusLabel(slug) {
  const key = String(slug || "").toLowerCase().replace(/\s+/g, "_");
  if (!key) return "—";
  const pretty = {
    present: "Present",
    completed: "Completed",
    full_day: "Full day",
    absent: "Absent",
    late: "Late",
    half_day: "Half day",
    pending: "Pending",
  };
  if (pretty[key]) return pretty[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function summarizeAttendanceRecords(records) {
  if (!Array.isArray(records)) return { daysWorked: 0, fullDays: 0, halfDays: 0 };
  let daysWorked = 0;
  let fullDays = 0;
  let halfDays = 0;
  for (const rec of records) {
    if (!getCheckInDate(rec)) continue;
    daysWorked += 1;
    if (isHalfDayAttendance(rec)) {
      halfDays += 1;
    } else if (isFullDayAttendance(rec)) {
      fullDays += 1;
    }
  }
  return { daysWorked, fullDays, halfDays };
}
