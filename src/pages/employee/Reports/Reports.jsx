import React, { useState, useEffect } from "react";
import { FileText, Clock, Loader2 } from "lucide-react";
import apiService from "../../../api/service";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Colors for status distribution (mirroring admin reports)
const STATUS_COLORS = {
  approved: "#fb7312", // Dark orange
  pending: "#ffaf78", // Base orange
  active: "#feceac", // Light orange
  expired: "#64748B", // Slate
  rejected: "#ef4444", // Red
};

const AGE_COLORS = ["#fb7312", "#ffaf78", "#feceac", "#fed7aa", "#ffedd5"];

// Static gender data (no specific API provided for gender split yet)
const genderData = [
  { name: "Male", value: 6732, percent: "52.4%", color: "#ffaf78" },
  { name: "Female", value: 5814, percent: "45.3%", color: "#feefe2" },
  { name: "Other", value: 301, percent: "2.3%", color: "#fb7312" },
];

// Custom Tooltip for Area Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-50 text-center relative pointer-events-none">
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-[13px] font-extrabold text-[#0F172A]">
          Cards: <span className="text-[#F97316]">{payload[0].value}</span>
        </p>
        <div className="absolute w-3 h-3 bg-white border-b border-r border-gray-50 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Chart
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFFFFF] px-3 py-2 rounded-lg shadow-xl">
        <p className="text-[#64748B] text-xs font-bold">{label}</p>
        <p className="text-[#F97316] text-sm font-bold">
          {payload[0].value.toLocaleString()} cards
        </p>
      </div>
    );
  }
  return null;
};

const CustomDonutChart = ({
  data,
  total,
  renderCenter,
  size = 220,
  strokeWidth = 24,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const slices = data.map((item, index) => {
    const length = (item.value / total) * circumference;
    // Calculate offset without mutating outer variable to keep it pure for render
    const offset = data.slice(0, index).reduce((acc, prev) => acc + (prev.value / total) * circumference, 0);
    return {
      ...item,
      length,
      offset,
    };
  });

  const handleMouseMove = (e, slice) => {
    const container = e.currentTarget.closest("[data-chart-container]");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      content: slice,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      className="relative flex items-center justify-center mx-auto"
      style={{ width: size, height: size }}
      data-chart-container
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#FFEDD5"
          strokeWidth={strokeWidth}
        />
        {slices.map((slice, i) => {
          if (slice.length === 0) return null;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${slice.length} ${circumference}`}
              strokeDashoffset={animated ? -slice.offset : circumference}
              style={{
                transition:
                  "stroke-dasharray 1s ease-out, stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
              }}
              onMouseMove={(e) => handleMouseMove(e, slice)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {renderCenter && renderCenter()}
      </div>

      {tooltip.visible && tooltip.content && (
        <div
          className="absolute z-10 bg-white px-3 py-2 rounded-lg shadow-xl border border-gray-100 pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            marginTop: "-10px",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: tooltip.content.color }}
            ></span>
            <p className="text-gray-500 text-xs font-bold leading-none">
              {tooltip.content.name}
            </p>
          </div>
          <p className="text-[#0F172A] text-sm font-extrabold leading-none pl-4">
            {tooltip.content.value.toLocaleString()}
            <span className="text-gray-400 font-semibold text-[10px] ml-1">
              ({((tooltip.content.value / total) * 100).toFixed(1)}%)
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

const Reports = () => {
  const [timeFilter, setTimeFilter] = useState("Monthly");
  const [loading, setLoading] = useState(true);

  // Live data states (aligned with admin reports)
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [locations, setLocations] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [periodMetrics, setPeriodMetrics] = useState(null);

  const [genericTooltip, setGenericTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    value: "",
  });

  const handleGenericMouseMove = (e, title, value) => {
    setGenericTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      title,
      value,
    });
  };

  const handleGenericMouseLeave = () => {
    setGenericTooltip({ visible: false, x: 0, y: 0, title: "", value: "" });
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  useEffect(() => {
    fetchTimeframeMetrics();
  }, [timeFilter]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        trendRes,
        statusRes,
        ageRes,
        locationRes,
        performanceRes,
      ] = await Promise.all([
        apiService.getReportsSummary(),
        apiService.getReportsMonthlyTrend(),
        apiService.getReportsCardsStatus(),
        apiService.getReportsCardsAgeGroups(),
        apiService.getReportsCardsLocation(),
        apiService.getReportsEmployeePerformance(),
      ]);

      if (summaryRes?.success) setSummary(summaryRes.data);

      if (trendRes?.success) {
        const mappedTrend = (trendRes.data?.trend || []).map((item) => ({
          name: item.month,
          cards: item.cardsIssued,
        }));
        setTrendData(mappedTrend);
      }

      if (statusRes?.success) {
        const mappedStatus = (statusRes.data || []).map((item) => ({
          name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          value: item.count,
          percentage: item.percentage,
          color: STATUS_COLORS[item.status] || "#fa8112",
        }));
        setStatusDistribution(mappedStatus);
      }

      if (ageRes?.success) {
        const mappedAge = (ageRes.data || []).map((item, idx) => ({
          name: item.ageGroup,
          value: item.count,
          percentage: item.percentage,
          color: AGE_COLORS[idx % AGE_COLORS.length],
        }));
        setAgeDistribution(mappedAge);
      }

      if (locationRes?.success) setLocations(locationRes.data || []);
      if (performanceRes?.success) setPerformance(performanceRes.data || []);
    } catch (err) {
      console.error("Error fetching employee report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeframeMetrics = async () => {
    try {
      let res;
      if (timeFilter === "Daily") res = await apiService.getReportsDaily();
      else if (timeFilter === "Monthly") res = await apiService.getReportsMonthly();
      else if (timeFilter === "Yearly") res = await apiService.getReportsYearly();
      else return;

      if (res?.success) setPeriodMetrics(res.data?.metrics);
    } catch (err) {
      console.error(`Error fetching employee ${timeFilter} metrics:`, err);
    }
  };

  const maxLocationCount =
    locations.reduce((max, loc) => Math.max(max, loc.count || 0), 0) || 1;

  const maxTopLocationCount =
    locations.slice(0, 6).reduce((max, loc) => Math.max(max, loc.count || 0), 0) ||
    1;

  const maxEmployeeCards =
    performance.reduce((max, emp) => Math.max(max, emp.cardsIssued || 0), 0) ||
    1;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("Ayush Card Analytics Report", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.text(`Generated: ${today}`, pageWidth - 14, 20, { align: "right" });

    doc.setFontSize(10);
    doc.text("Maharashtra Health Authority • Live Data Report", 14, 26);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);

    let currentY = 40;

    const addSectionTitle = (title) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(title, 14, currentY);
      currentY += 5;
    };

    // 1. Key Summary
    addSectionTitle("1. Key Summary");
    autoTable(doc, {
      startY: currentY,
      head: [["Metric", "Value", "Notes"]],
      body: [
        [
          "Total Health Cards Issued",
          summary?.totalCards?.toLocaleString() || "0",
          "All time",
        ],
        [
          "Verified Cards",
          summary?.verifiedCards?.toLocaleString() || "0",
          summary?.totalCards > 0
            ? `${(
                (summary.verifiedCards / summary.totalCards) * 100
              ).toFixed(1)}% success`
            : "0% success",
        ],
        [
          "Pending Verification",
          summary?.pendingCards?.toLocaleString() || "0",
          "Awaiting review",
        ],
        [
          "Expiring Soon",
          summary?.expiringSoon?.toLocaleString() || "0",
          "Next 30 days",
        ],
      ],
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 2. Monthly Issuance Trend
    addSectionTitle("2. Monthly Issuance Trend");
    const trendBody = trendData.map((item) => [
      item.name,
      item.cards.toLocaleString(),
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [["Month", "Cards Issued"]],
      body: trendBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 3. Status Distribution
    addSectionTitle("3. Distribution by Status");
    const statusBody = statusDistribution.map((item) => [
      item.name,
      item.value.toLocaleString(),
      `${item.percentage}%`,
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [["Status", "Count", "Percentage"]],
      body: statusBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 4. Age Distribution
    addSectionTitle("4. Age Group Distribution");
    const ageBody = ageDistribution.map((item) => [
      item.name,
      item.value.toLocaleString(),
      `${item.percentage}%`,
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [["Age bracket", "Count", "Percentage"]],
      body: ageBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 5. Location Distribution
    addSectionTitle("5. Geographic Distribution (Top 15 Pincodes)");
    const locBody = locations.slice(0, 15).map((loc) => [
      loc.rank,
      loc.pincode,
      loc.count.toLocaleString(),
      `${loc.percentage}%`,
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [["Rank", "Pincode", "Count", "Percentage"]],
      body: locBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 6. Employee Performance
    addSectionTitle("6. Field Employee Performance");
    const perfBody = performance.map((emp) => [
      emp.rank,
      emp.name,
      emp.cardsIssued.toLocaleString(),
      `${emp.percentageOfTop}%`,
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [["Rank", "Name", "Cards Issued", "% of Top"]],
      body: perfBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Official Maharashtra Ayush Authority Analytics Report • Confidential",
        14,
        290,
      );
      doc.text(`Page ${i}`, pageWidth - 14, 290, { align: "right" });
    }

    doc.save(
      `Ayush_Card_Analytics_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fa8112] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="w-full bg-[#ffffff] min-h-screen"
      style={{ fontFamily: "Instrument Sans, sans-serif" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#242D35]">Reports</h1>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-[#F68E5F] text-white px-4 py-2 rounded-lg text-[14px] font-semibold shadow-sm hover:bg-[#ff7535] transition-colors"
        >
          <FileText className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Cards Issued */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#F97316]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            TOTAL CARDS ISSUED
          </p>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
            {(summary?.totalCards || 0).toLocaleString()}
          </h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            Live data
          </p>
        </div>

        {/* Verified Cards */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            VERIFIED CARDS
          </p>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
            {(summary?.verifiedCards || 0).toLocaleString()}
          </h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            {summary?.totalCards > 0
              ? `${(
                  (summary.verifiedCards / summary.totalCards) * 100
                ).toFixed(1)}% verified`
              : "0% verified"}
          </p>
        </div>

        {/* Pending Cards */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#06B6D4]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            PENDING CARDS
          </p>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
            {(summary?.pendingCards || 0).toLocaleString()}
          </h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            Action required
          </p>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            EXPIRING SOON
          </p>
          <h2 className="text-3xl font-extrabold text-[#0F172A] mb-3">
            {(summary?.expiringSoon || 0).toLocaleString()}
          </h2>
          <p className="text-xs font-bold text-[#F97316] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Next 30 days
          </p>
        </div>
      </div>

      {/* Row 1: Cards by Status (Pie) + New Cards Issued (Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Cards by Status */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9] flex flex-col">
          <h3 className="text-lg font-bold text-[#0F172A]">Cards by Status</h3>
          <p className="text-xs text-[#94A3B8] mb-6 font-normal tracking-wide">
            Distribution by application status
          </p>

          <div className="flex-1 relative min-h-[220px] mb-8 flex items-center justify-center">
            <CustomDonutChart
              data={statusDistribution}
              total={summary?.totalCards || 0}
              renderCenter={() => (
                <>
                  <span className="text-3xl font-extrabold text-[#0F172A]">
                    {(summary?.totalCards || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">
                    TOTAL CARDS
                  </span>
                </>
              )}
              size={220}
              strokeWidth={25}
            />
          </div>

          <div className="space-y-3">
            {statusDistribution.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-gray-500 font-normal">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#F97316]">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-[#F97316] bg-[#FFF1F2] px-2.5 py-1 rounded-full">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Cards Issued */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9] lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                New Cards Issued
              </h3>
              <p className="text-xs text-[#94A3B8] font-normal mt-0.5 tracking-wide">
                Volume trend for Year {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex bg-[#F8FAFC] rounded-lg p-1 border border-gray-100">
              {["Daily", "Monthly", "Yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    period === timeFilter
                      ? "bg-[#F97316] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#F0F9FF] rounded-[16px] p-4 border border-[#E0F2FE]">
              <p className="text-[10px] font-bold text-[#0284C7] uppercase tracking-widest mb-1">
                TOTAL IN PERIOD
              </p>
              <p className="text-2xl font-bold text-[#0C4A6E]">
                {periodMetrics?.totalCards || 0}
              </p>
            </div>
            <div className="bg-[#ECFDF5] rounded-[16px] p-4 border border-[#D1FAE5]">
              <p className="text-[10px] font-bold text-[#059669] uppercase tracking-widest mb-1">
                VERIFIED
              </p>
              <p className="text-2xl font-bold text-[#064E3B]">
                {periodMetrics?.verifiedCards || periodMetrics?.approvedCards || 0}
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-[16px] p-4 border border-[#F1F5F9]">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">
                PENDING
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {periodMetrics?.unverifiedCards || periodMetrics?.pendingCards || 0}
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                  dy={12}
                />
                <YAxis hide={true} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={false}
                  isAnimationActive={false}
                />
                <Area
                  type="linear"
                  dataKey="cards"
                  stroke="#F97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCards)"
                  activeDot={{
                    r: 5,
                    fill: "#F97316",
                    stroke: "#fff",
                    strokeWidth: 2,
                    className: "drop-shadow-md",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Age Group Distribution + Gender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Age Group Distribution */}
        <div
          className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9] relative"
          data-age-chart-container
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Age Group Distribution
            </h3>
            <p className="text-xs text-[#94A3B8] font-normal mt-0.5 tracking-wide">
              Ayush cards issued by age bracket
            </p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "#6D758F", fontWeight: 400 }}
                  dy={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "#6D758F", fontWeight: 400 }}
                  tickCount={6}
                  domain={[0, 4700]}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#F8FAFC" }} />
                <Bar
                  dataKey="value"
                  fill="#F97316"
                  radius={[6, 6, 6, 6]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Gender Distribution
            </h3>
            <p className="text-xs text-[#94A3B8] font-normal mt-0.5 tracking wide">
              Card holders by gender
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between h-[280px]">
            <div className="w-full md:w-1/2 h-full relative flex items-center justify-center min-h-[260px]">
              <CustomDonutChart
                data={genderData}
                total={12847}
                renderCenter={() => (
                  <>
                    <span className="text-3xl font-extrabold text-[#0F172A]">
                      52.4%
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      MALE MAJOR
                    </span>
                  </>
                )}
                size={200}
                strokeWidth={25}
              />
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-4 bg-white mt-4 md:mt-0">
              {genderData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#F8FAFC] px-4 py-3 rounded-xl border border-[#F1F5F9]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-sm font-bold text-[#0F172A]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#0F172A]">
                      {item.value.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 w-10 text-right">
                      {item.percent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Location-wise Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9] mb-6">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#0F172A]">
            Location-wise Distribution
          </h3>
          <p className="text-xs text-[#94A3B8] font-normal mt-0.5 tracking-wide">
            Ayush cards issued across districts / cities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left side: Main Districts */}
          <div className="space-y-5">
            {locations.slice(0, 8).map((item, idx) => (
              <div key={idx} className="flex items-center gap-6">
                <span className="w-20 text-xs text-[#64748B] font-medium text-right">
                  Pincode {item.pincode}
                </span>
                <div className="flex-1 h-[24px] bg-[#F1F5F9] rounded-r-lg overflow-hidden flex items-center relative isolation-auto border-l-0">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#F97316] rounded-r-lg transition-all duration-1000 ease-out cursor-pointer hover:brightness-110"
                    style={{ width: `${(item.count / maxLocationCount) * 100}%` }}
                    onMouseMove={(e) =>
                      handleGenericMouseMove(
                        e,
                        item.name,
                        `${item.count.toLocaleString()} cards`,
                      )
                    }
                    onMouseLeave={handleGenericMouseLeave}
                  ></div>
                </div>
              </div>
            ))}

            <div className="flex pl-26 pr-4 justify-between text-[10px] font-normal text-[#94A3B8] mt-4 border-t border-gray-100 pt-4">
              <span>0</span>
              <span>850</span>
              <span>1700</span>
              <span>2550</span>
              <span>3400</span>
            </div>
          </div>

          {/* Right side: Ranked Cities */}
          <div className="space-y-6 lg:pl-8">
            {locations.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 group">
                <div className="flex justify-between items-end mb-0.5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-[11px] font-extrabold shadow-sm group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-[#1E293B]">
                      Pincode {item.pincode}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#1E293B]">
                    {item.count.toLocaleString()}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 ml-9 relative"
                  style={{ width: "calc(100% - 36px)" }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-[#F1F5F9] rounded-full"></div>
                  <div
                    className="absolute top-0 left-0 h-full bg-[#F97316] rounded-l-full transition-all duration-1000 ease-out cursor-pointer hover:brightness-110"
                    style={{
                      width: `${(item.count / maxTopLocationCount) * 100}%`,
                    }}
                    onMouseMove={(e) =>
                      handleGenericMouseMove(
                        e,
                        item.name,
                        `${item.count.toLocaleString()} cards`,
                      )
                    }
                    onMouseLeave={handleGenericMouseLeave}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Cards Generated by Field Employees */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9] mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Cards Generated by Field Employees
            </h3>
            <p className="text-xs text-[#94A3B8] font-normal mt-0.5 tracking-wide">
              Top performing field staff this quarter
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
              <span className="flex items-center gap-1 text-[#F59E0B]">
                <img src="/admin_images/top1.svg" alt="1st" /> Top
              </span>
              <span className="flex items-center gap-1 text-[#94A3B8]">
                <img src="/admin_images/top2.svg" alt="2nd" /> 2nd
              </span>
              <span className="flex items-center gap-1 text-[#FB923C]">
                <img src="/admin_images/top3.svg" alt="3rd" /> 3rd
              </span>
            </div>
            <button className="bg-[#F0FDFA] text-[#0D9488] px-4 py-2 rounded-lg text-sm font-bold border border-[#99F6E4] hover:bg-[#D1FAE5] transition-colors">
              Top 10 Employees
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left side: Horizontal Chart */}
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-6">
              CARDS GENERATED
            </p>

            <div className="space-y-5">
              {performance.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-6 relative group"
                >
                  <span className="w-20 text-[12px] text-[#64748B] font-medium text-right">
                    {item.name}
                  </span>
                  <div className="flex-1 h-6 bg-[#F1F5F9] rounded-r-full overflow-hidden flex items-center relative border border-gray-50 border-l-0">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#F97316] rounded-full transition-all duration-1000 flex items-center justify-end pr-3 cursor-pointer hover:brightness-110"
                      style={{
                        width: `${(item.cardsIssued / maxEmployeeCards) * 100}%`,
                      }}
                      onMouseMove={(e) =>
                        handleGenericMouseMove(
                          e,
                          item.name,
                          `${item.cardsIssued.toLocaleString()} cards`,
                        )
                      }
                      onMouseLeave={handleGenericMouseLeave}
                    >
                      <span className="text-xs font-bold text-white shadow-xs pointer-events-none">
                        {item.cardsIssued}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex pl-26 pr-4 justify-between text-[10px] font-normal text-[#94A3B8] mt-6 border-t border-gray-100 pt-4">
                <span>0</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
                <span>400</span>
              </div>
            </div>
          </div>

          {/* Right side: Ranked Leaderboard */}
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-6">
              RANKED LEADERBOARD
            </p>

            <div className="space-y-4">
              {performance.slice(0, 4).map((emp, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 pb-5 flex items-center gap-4 relative overflow-hidden border border-[#F1F5F9]"
                >
                  {/* Progress Line at bottom */}
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-4 w-[95%] h-1 bg-[#14B8A6] rounded-lg"></div>
                  )}
                  {idx === 1 && (
                    <div className="absolute bottom-2 left-4 w-[85%] h-1 bg-[#2DD4BF] rounded-lg"></div>
                  )}
                  {idx === 2 && (
                    <div className="absolute bottom-2 left-4 w-[80%] h-1 bg-[#2DD4BF] rounded-lg"></div>
                  )}
                  {idx === 3 && (
                    <div className="absolute bottom-2 left-4 w-[73%] h-1 bg-[#0EA5E9] rounded-lg"></div>
                  )}

                  {/* Avatar/Rank Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? "bg-[#F59E0B33] text-[#D97706]"
                        : idx === 1
                          ? "bg-[#94A3B833] text-[#64748B]"
                          : idx === 2
                            ? "bg-[#FB923C33] text-[#C2410C]"
                            : "bg-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    {idx === 0 ? (
                      <img
                        src="/admin_images/top1.svg"
                        alt="1st"
                        className="w-6 h-6"
                      />
                    ) : idx === 1 ? (
                      <img
                        src="/admin_images/top2.svg"
                        alt="2nd"
                        className="w-6 h-6"
                      />
                    ) : idx === 2 ? (
                      <img
                        src="/admin_images/top3.svg"
                        alt="3rd"
                        className="w-6 h-6"
                      />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Employee Info */}
                  <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-[#0F172A]">
                      {emp.name}
                    </h4>
                    <p className="text-[10px] font-normal text-[#64748B] mt-0.5">
                      ID: {emp.employeeId?.slice(-6).toUpperCase() || "N/A"}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <h4
                      className={`text-xl font-extrabold ${idx > 0 ? "text-[#0F172A]" : "text-[#14B8A6]"}`}
                    >
                      {emp.cardsIssued}
                    </h4>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 mb-1">
                      {emp.percentageOfTop}% OF TOP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {genericTooltip.visible && (
        <div
          className="fixed z-50 bg-[#FFFFFF] px-3 py-2 rounded-lg shadow-xl pointer-events-none transition-opacity duration-150"
          style={{
            left: genericTooltip.x,
            top: genericTooltip.y,
            transform: "translate(-50%, -100%)",
            marginTop: "-15px",
          }}
        >
          <p className="text-[#64748B] text-xs font-bold">
            {genericTooltip.title}
          </p>
          <p className="text-[#F97316] text-sm font-bold">
            {genericTooltip.value}
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
