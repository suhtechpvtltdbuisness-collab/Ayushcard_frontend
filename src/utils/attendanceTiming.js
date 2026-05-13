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

export function formatWorkingHours(rec) {
  if (rec == null) return "—";
  const wh =
    rec.workingHours ??
    rec.workHours ??
    rec.durationLabel ??
    rec.workDuration ??
    (typeof rec.totalHours === "number" ? `${rec.totalHours}h` : null);
  if (wh != null && wh !== "") return String(wh);

  const mins =
    rec.workingMinutes ??
    rec.durationMinutes ??
    rec.workDurationMinutes ??
    (typeof rec.durationMins === "number" ? rec.durationMins : null);
  if (typeof mins === "number" && mins > 0) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  const inD = getCheckInDate(rec);
  const outD = getCheckOutDate(rec);
  if (inD && outD) {
    const ms = outD.getTime() - inD.getTime();
    if (ms > 0) {
      const totalMin = Math.floor(ms / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    }
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
    return "completed";
  }
  if (inn) {
    if (raw === "late") return "late";
    if (raw === "absent") return "absent";
    if (raw === "half_day" || raw === "halfday") return "half_day";
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
    absent: "Absent",
    late: "Late",
    half_day: "Half day",
    pending: "Pending",
  };
  if (pretty[key]) return pretty[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
