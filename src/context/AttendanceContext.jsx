import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import apiService from "../api/service";

const AttendanceContext = createContext(null);

const TODAY_KEY = () => {
  const d = new Date();
  return `attendance_marked_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
};

export function AttendanceProvider({ children }) {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [lastMarkedAt, setLastMarkedAt] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    if (userRole !== "Employee") {
      setChecking(false);
      return;
    }
    // Always verify against backend — sessionStorage is never the final source of truth
    checkTodayAttendance();
  }, []);

  const checkTodayAttendance = async () => {
    try {
      setChecking(true);
      const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!user?._id) { setChecking(false); return; }

      const today = new Date().toISOString().slice(0, 10);
      const res = await apiService.getUserAttendance(user._id, { date: today });
      const list = res?.data?.attendances || [];

      if (list.length > 0) {
        // Confirmed on backend
        sessionStorage.setItem(TODAY_KEY(), "true");
        setAttendanceMarked(true);
      } else {
        // Clear any stale cache and prompt
        sessionStorage.removeItem(TODAY_KEY());
        setAttendanceMarked(false);
        setTimeout(() => setShowModal(true), 5000);
      }
    } catch (err) {
      console.error("[AttendanceContext] Failed to check attendance:", err);
      // On error, clear cache so user isn't silently blocked
      sessionStorage.removeItem(TODAY_KEY());
      setAttendanceMarked(false);
    } finally {
      setChecking(false);
    }
  };

  const markSuccessful = useCallback(() => {
    sessionStorage.setItem(TODAY_KEY(), "true");
    setAttendanceMarked(true);
    setShowModal(false);
    setLastMarkedAt(Date.now());
  }, []);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  return (
    <AttendanceContext.Provider
      value={{ attendanceMarked, showModal, checking, lastMarkedAt, openModal, closeModal, markSuccessful }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance must be used within AttendanceProvider");
  return ctx;
}
