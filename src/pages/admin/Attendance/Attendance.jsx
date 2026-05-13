import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CalendarDays, Search, ArrowUpDown, Clock, MapPin } from "lucide-react";
import apiService from "../../../api/service";
import Pagination from "../../../components/ui/Pagination";
import {
  formatClock,
  formatWorkingHours,
  getCheckInDate,
  getCheckOutDate,
  getRowCalendarDate,
  getDisplayAttendanceStatus,
  attendanceStatusClass,
  formatAttendanceStatusLabel,
} from "../../../utils/attendanceTiming";

function recordStatusBadge(rec) {
  const slug = getDisplayAttendanceStatus(rec);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${attendanceStatusClass(slug)}`}>
      {formatAttendanceStatusLabel(slug)}
    </span>
  );
}

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [fromDate, setFromDate] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  });
  const [toDate, setToDate] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  });

  const fetchAttendance = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await apiService.getAttendance({
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
        console.error("Failed to fetch attendance", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentPage, itemsPerPage, fromDate, toDate],
  );

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    const pollMs = 30000;
    const tick = () => {
      if (document.visibilityState === "visible") fetchAttendance(true);
    };
    const id = setInterval(tick, pollMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [fetchAttendance]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const processedData = useMemo(() => {
    let result = records.filter((r) => {
      const name   = r.userId?.name || "";
      const empId  = r.userId?.employeeId || "";
      const camp   = r.campId?.name || "";
      const city   = r.city || "";
      const q = searchQuery.toLowerCase();
      return (
        name.toLowerCase().includes(q) ||
        empId.toLowerCase().includes(q) ||
        camp.toLowerCase().includes(q) ||
        city.toLowerCase().includes(q)
      );
    });

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let av;
        let bv;
        if (sortConfig.key === "employee") {
          av = a.userId?.name;
          bv = b.userId?.name;
        } else if (sortConfig.key === "camp") {
          av = a.campId?.name;
          bv = b.campId?.name;
        } else if (sortConfig.key === "date") {
          av = getRowCalendarDate(a)?.getTime() ?? 0;
          bv = getRowCalendarDate(b)?.getTime() ?? 0;
        } else {
          av = a[sortConfig.key];
          bv = b[sortConfig.key];
        }
        if (sortConfig.key === "date") {
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return sortConfig.direction === "asc" ? cmp : -cmp;
        }
        av = av || "";
        bv = bv || "";
        const cmp = typeof av === "string" ? av.localeCompare(bv) : av < bv ? -1 : av > bv ? 1 : 0;
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [records, searchQuery, sortConfig]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.length > itemsPerPage
    ? processedData.slice(startIndex, startIndex + itemsPerPage)
    : processedData;

  const SortHeader = ({ title, sortKey, className = "" }) => (
    <th className={`py-3 px-4 text-sm font-semibold text-[#22333B] whitespace-nowrap ${className}`}>
      <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600" onClick={() => handleSort(sortKey)}>
        {title}
        <ArrowUpDown size={13} className={sortConfig.key === sortKey ? "text-[#F68E5F]" : "text-[#22333B]"} />
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] min-h-[560px]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 shrink-0">
        <h2 className="text-xl font-bold text-[#22333B]">Attendance</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search employee, camp, city…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-4 pr-10 py-2.5 border border-[#E5E7EB] rounded-full text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]"
          />
          <Search size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1E1E]" />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-[#6B7280]" />
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
          onClick={() => { setCurrentPage(1); fetchAttendance(); }}
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
        ) : paginatedData.length > 0 ? (
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="min-w-[1120px] w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white border-b border-[#F3F4F6]">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-12">Sr.</th>
                  <SortHeader title="Employee"  sortKey="employee"  className="min-w-[180px]" />
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] whitespace-nowrap">Emp ID</th>
                  <SortHeader title="Camp"      sortKey="camp"      className="min-w-[160px]" />
                  <SortHeader title="Date" sortKey="date" className="whitespace-nowrap" />
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] whitespace-nowrap">Check-in</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] whitespace-nowrap">Check-out</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] whitespace-nowrap">Working hours</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B]">Location</th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-[110px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((rec, i) => {
                  const rowDay = getRowCalendarDate(rec);
                  const cin = getCheckInDate(rec);
                  const cout = getCheckOutDate(rec);
                  const duration = formatWorkingHours(rec);
                  return (
                  <tr key={rec._id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4 text-sm text-[#22333B]">{startIndex + i + 1}</td>

                    {/* Employee */}
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-[#22333B]">{rec.userId?.name || "—"}</p>
                      <p className="text-xs text-[#6B7280]">{rec.userId?.email || ""}</p>
                    </td>

                    {/* Emp ID */}
                    <td className="py-3 px-4 text-sm text-[#22333B] whitespace-nowrap">
                      {rec.userId?.employeeId || "—"}
                    </td>

                    {/* Camp */}
                    <td className="py-3 px-4">
                      {rec.campId ? (
                        <>
                          <p className="text-sm font-medium text-[#22333B]">{rec.campId.name}</p>
                          <p className="text-xs text-[#6B7280]">{rec.campId.city}, {rec.campId.state}</p>
                        </>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">No camp</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-sm text-[#22333B]">
                        {rowDay
                          ? rowDay.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-sm text-[#22333B] flex items-center gap-1 whitespace-nowrap">
                        <Clock size={12} className="text-[#9CA3AF] shrink-0" />
                        {formatClock(cin)}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-sm text-[#22333B] flex items-center gap-1 whitespace-nowrap">
                        <Clock size={12} className="text-[#9CA3AF] shrink-0" />
                        {formatClock(cout)}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-sm font-medium text-[#22333B] whitespace-nowrap">{duration}</td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <p className="text-sm text-[#22333B]">{rec.city || "—"}{rec.state ? `, ${rec.state}` : ""}</p>
                      <p className="text-xs text-[#6B7280] font-mono flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />
                        {rec.lat != null && rec.long != null ? `${Number(rec.lat).toFixed(4)}, ${Number(rec.long).toFixed(4)}` : "—"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">{recordStatusBadge(rec)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-[#6B7280]">
            <CalendarDays size={40} className="text-gray-300" />
            <p className="text-base font-semibold text-[#22333B]">No attendance records found</p>
            <p className="text-sm text-[#9CA3AF]">Try adjusting the date range or search query.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        totalItems={totalItems}
      />
    </div>
  );
};

export default AdminAttendance;
