import React, { useState, useEffect } from "react";
import { CalendarDays, MapPin, CheckCircle2, Clock, ClipboardCheck } from "lucide-react";
import apiService from "../../../api/service";
import { useAttendance } from "../../../context/AttendanceContext";
import Pagination from "../../../components/ui/Pagination";

const statusBadge = (status) => {
  const map = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const EmployeeAttendance = () => {
  const { attendanceMarked, openModal, lastMarkedAt } = useAttendance();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Date filter
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchAttendance();
  }, [currentPage, fromDate, toDate, lastMarkedAt]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!user?._id) return;

      const res = await apiService.getUserAttendance(user._id, {
        fromDate,
        toDate,
        page: currentPage,
        limit: itemsPerPage,
      });

      const list = res?.data?.attendances || [];
      setRecords(list);

      const pag = res?.data?.pagination || {};
      setTotalItems(Number(pag.total || list.length));
      setTotalPages(Number(pag.pages || Math.ceil((pag.total || list.length) / itemsPerPage) || 1));
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] min-h-[560px]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#22333B]">My Attendance</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Track your daily attendance records</p>
        </div>
        {!attendanceMarked ? (
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F68E5F] text-white font-medium rounded-xl hover:bg-[#ff7535] transition-colors shadow-sm text-sm"
          >
            <MapPin size={16} />
            Mark Today's Attendance
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
            <CheckCircle2 size={16} className="text-green-500" />
            Attendance marked today
          </div>
        )}
      </div>

      {/* Today's status card */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl border mb-4 shrink-0 ${attendanceMarked ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${attendanceMarked ? "bg-green-100" : "bg-orange-100"}`}>
          <ClipboardCheck size={24} className={attendanceMarked ? "text-green-600" : "text-[#F68E5F]"} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#22333B]">
            {attendanceMarked ? "You're checked in for today!" : "Not checked in yet"}
          </p>
          <p className="text-xs text-[#6B7280]">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#6B7280]" />
          <span className="text-sm text-[#6B7280] font-medium">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
            className="border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#F68E5F]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6B7280] font-medium">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
            className="border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#F68E5F]"
          />
        </div>
        <button
          onClick={fetchAttendance}
          className="px-4 py-1.5 bg-[#F68E5F] text-white text-sm rounded-lg hover:bg-[#ff7535] transition-colors"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9D9D9] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="min-w-[700px] w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-[#F3F4F6]">
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-12">Sr.</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B]">Date &amp; Time</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B]">Camp</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B]">Location</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B]">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={rec._id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4 text-sm text-[#22333B]">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-[#22333B]">
                        {new Date(rec.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {new Date(rec.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {rec.campId ? (
                        <>
                          <p className="text-sm font-medium text-[#22333B]">{rec.campId.name}</p>
                          <p className="text-xs text-[#6B7280]">{rec.campId.city}, {rec.campId.state}</p>
                        </>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-[#22333B]">{rec.city || "—"}</p>
                      <p className="text-xs text-[#6B7280] font-mono">{rec.lat?.toFixed(4)}, {rec.long?.toFixed(4)}</p>
                    </td>
                    <td className="py-3 px-4">{statusBadge(rec.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#6B7280] gap-3">
            <CalendarDays size={40} className="text-gray-300" />
            <p className="text-base font-semibold text-[#22333B]">No attendance records found</p>
            <p className="text-sm text-[#9CA3AF]">Try adjusting the date range above.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={() => {}}
        totalItems={totalItems}
      />
    </div>
  );
};

export default EmployeeAttendance;
