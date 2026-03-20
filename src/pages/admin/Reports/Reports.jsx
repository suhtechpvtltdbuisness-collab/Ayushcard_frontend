import React, { useState, useEffect } from "react";
import { FileText, Clock, Loader2, TrendingUp, TrendingDown } from "lucide-react";
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

// Colors for status distribution
const STATUS_COLORS = {
  approved: "#fb7312", // Dark orange
  pending: "#ffaf78",  // Base orange
  active: "#feceac",   // Light orange
  expired: "#64748B",  // Slate
  rejected: "#ef4444", // Red
};

const AGE_COLORS = ["#fb7312", "#ffaf78", "#feceac", "#fed7aa", "#ffedd5"];

// Custom Tooltip for Charts
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

  // States for live data
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [locations, setLocations] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [periodMetrics, setPeriodMetrics] = useState(null);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("Health Card Analytics Report", 14, 20);

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
        ["Total Health Cards Issued", summary?.totalCards?.toLocaleString() || "0", "All time"],
        ["Verified Cards", summary?.verifiedCards?.toLocaleString() || "0", `${summary?.totalCards > 0 ? ((summary.verifiedCards / summary.totalCards) * 100).toFixed(1) : 0}% success`],
        ["Pending Verification", summary?.pendingCards?.toLocaleString() || "0", "Awaiting review"],
        ["Expiring Soon", summary?.expiringSoon?.toLocaleString() || "0", "Next 30 days"],
      ],
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 2. Trend
    addSectionTitle("2. Monthly Issuance Trend");
    const trendBody = trendData.map(item => [item.name, item.cards.toLocaleString()]);
    autoTable(doc, {
      startY: currentY,
      head: [["Month", "Cards Issued"]],
      body: trendBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 3. Status
    addSectionTitle("3. Distribution by Status");
    const statusBody = statusDistribution.map(item => [item.name, item.value.toLocaleString(), `${item.percentage}%`]);
    autoTable(doc, {
      startY: currentY,
      head: [["Status", "Count", "Percentage"]],
      body: statusBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 4. Age
    addSectionTitle("4. Age Group Distribution");
    const ageBody = ageDistribution.map(item => [item.name, item.value.toLocaleString(), `${item.percentage}%`]);
    autoTable(doc, {
      startY: currentY,
      head: [["Age bracket", "Count", "Percentage"]],
      body: ageBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 5. Locations
    addSectionTitle("5. Geographic Distribution (Top 15 Pincodes)");
    const locBody = locations.slice(0, 15).map(loc => [loc.rank, loc.pincode, loc.count.toLocaleString(), `${loc.percentage}%`]);
    autoTable(doc, {
      startY: currentY,
      head: [["Rank", "Pincode", "Count", "Percentage"]],
      body: locBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 6. Performance
    addSectionTitle("6. Field Employee Performance");
    const perfBody = performance.map(emp => [emp.rank, emp.name, emp.cardsIssued.toLocaleString(), `${emp.percentageOfTop}%`]);
    autoTable(doc, {
      startY: currentY,
      head: [["Rank", "Name", "Cards Issued", "Of Top(%)"]],
      body: perfBody,
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      theme: "grid",
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Official Maharashtra Ayush Authority Analytics Report • Confidential", 14, 290);
      doc.text(`Page ${i}`, pageWidth - 14, 290, { align: "right" });
    }

    doc.save(`Ayush_Card_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const [genericTooltip, setGenericTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    value: "",
  });

  useEffect(() => {
    fetchAllReports();
  }, []);

  // Re-fetch period metrics when timeframe changes
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
        performanceRes
      ] = await Promise.all([
        apiService.getReportsSummary(),
        apiService.getReportsMonthlyTrend(),
        apiService.getReportsCardsStatus(),
        apiService.getReportsCardsAgeGroups(),
        apiService.getReportsCardsLocation(),
        apiService.getReportsEmployeePerformance()
      ]);

      if (summaryRes?.success) setSummary(summaryRes.data);
      
      if (trendRes?.success) {
        const mappedTrend = (trendRes.data?.trend || []).map(item => ({
          name: item.month,
          cards: item.cardsIssued
        }));
        setTrendData(mappedTrend);
      }

      if (statusRes?.success) {
        const mappedStatus = (statusRes.data || []).map(item => ({
          name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          value: item.count,
          percentage: item.percentage,
          color: STATUS_COLORS[item.status] || "#fa8112"
        }));
        setStatusDistribution(mappedStatus);
      }

      if (ageRes?.success) {
        const mappedAge = (ageRes.data || []).map((item, idx) => ({
          name: item.ageGroup,
          value: item.count,
          percentage: item.percentage,
          color: AGE_COLORS[idx % AGE_COLORS.length]
        }));
        setAgeDistribution(mappedAge);
      }

      if (locationRes?.success) setLocations(locationRes.data || []);
      if (performanceRes?.success) setPerformance(performanceRes.data || []);

    } catch (err) {
      console.error("Error fetching report data:", err);
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
      else return; // Weekly not explicitly provided by user APIs

      if (res?.success) setPeriodMetrics(res.data?.metrics);
    } catch (err) {
      console.error(`Error fetching ${timeFilter} metrics:`, err);
    }
  };

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
          className="flex items-center gap-2 bg-[#F68E5F] text-white px-4 py-2 rounded-lg text-[16px] font-semibold shadow-sm hover:bg-[#ff7535] transition-colors"
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
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">{summary?.totalCards || 0}</h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            <TrendingUp size={16} /> Live Data
          </p>
        </div>

        {/* Verified Cards */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            VERIFIED CARDS
          </p>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">{summary?.verifiedCards || 0}</h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            {summary?.totalCards > 0 ? ((summary.verifiedCards / summary.totalCards) * 100).toFixed(1) : 0}% success rate
          </p>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#06B6D4]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            PENDING CARDS
          </p>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">{summary?.pendingCards || 0}</h2>
          <p className="text-sm font-semibold text-orange-500 flex items-center gap-1">
            Action required
          </p>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            EXPIRING SOON
          </p>
          <h2 className="text-3xl font-extrabold text-[#0F172A] mb-3">{summary?.expiringSoon || 0}</h2>
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
                    {summary?.totalCards || 0}
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
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${period === timeFilter
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
              <p className="text-2xl font-bold text-[#0C4A6E]">{periodMetrics?.totalCards || 0}</p>
            </div>
            <div className="bg-[#ECFDF5] rounded-[16px] p-4 border border-[#D1FAE5]">
              <p className="text-[10px] font-bold text-[#059669] uppercase tracking-widest mb-1">
                VERIFIED
              </p>
              <p className="text-2xl font-bold text-[#064E3B]">{periodMetrics?.verifiedCards || periodMetrics?.approvedCards || 0}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-[16px] p-4 border border-[#F1F5F9]">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">
                ONGOING
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">{periodMetrics?.unverifiedCards || periodMetrics?.pendingCards || 0}</p>
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
                  type="monotone"
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
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9] relative">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Age Group Distribution
            </h3>
            <p className="text-xs text-[#94A3B8] font-normal mt-0.5 tracking-wide">
              Ayush cards issued by age bracket
            </p>
          </div>

          <div className="flex-1 min-h-[280px] flex items-center gap-8">
            <div className="flex-1 h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{ fill: "#F8FAFC" }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white px-3 py-2 rounded-lg shadow-xl border border-gray-100">
                             <p className="text-[#64748B] text-xs font-bold">{payload[0].payload.name}</p>
                             <p className="text-[#F97316] text-sm font-bold">{payload[0].value.toLocaleString()} cards</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    animationDuration={1500}
                  >
                    {ageDistribution.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-48 space-y-4">
              {ageDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-gray-400 uppercase tracking-tighter">
                      {item.name}
                    </span>
                    <span className="text-[#0F172A]">{item.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Period Metrics Card (Replacing Gender) */}
        <div className="bg-[#0F172A] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-white text-xl font-bold mb-1">
                  {timeFilter} Period Recap
                </h3>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                  Performance Snapshot
                </p>
              </div>
              <div className="bg-white/10 p-2 rounded-lg text-orange-400 backdrop-blur-sm">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-10 gap-x-12 relative z-10">
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Cards</p>
                <h4 className="text-3xl font-black text-white">{periodMetrics?.totalCards || 0}</h4>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Verified</p>
                <h4 className="text-3xl font-black text-[#10B981]">{periodMetrics?.verifiedCards || periodMetrics?.approvedCards || 0}</h4>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Organizations</p>
                <h4 className="text-3xl font-black text-white">{periodMetrics?.totalOrganizations || 0}</h4>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Donations</p>
                <h4 className="text-3xl font-black text-orange-500">{periodMetrics?.totalDonations || 0}</h4>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                      <Clock size={20} />
                   </div>
                   <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Staff Members</p>
                      <p className="text-white font-black text-sm">{periodMetrics?.totalEmployees || 0} Active Agents</p>
                   </div>
                </div>
                <div className="bg-orange-500/20 px-3 py-1 rounded-full text-orange-400 text-[10px] font-black uppercase tracking-widest">
                   Live Tracker
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Row 3: Location Distribution + Employee Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* Location-wise Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#F1F5F9] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Location Distribution</h3>
              <p className="text-xs text-[#94A3B8] font-normal tracking-wide uppercase">By Pincode Rank</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F97316]">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
            {locations.slice(0, 15).map((loc, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-gray-300 w-4">#{loc.rank}</span>
                    <span className="text-sm font-bold text-[#0F172A]">Pincode: {loc.pincode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#0F172A]">{loc.count}</span>
                    <span className="text-[10px] font-bold text-gray-400 ml-2">({loc.percentage}%)</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#fa8112] rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(loc.percentage * 8, 100)}%` }} 
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Performance Rankings */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#F1F5F9] shadow-xs flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#F1F5F9]">
            <h3 className="text-xl font-bold text-[#0F172A] mb-1">Top Field Performance</h3>
            <p className="text-xs text-[#94A3B8] font-normal tracking-wide uppercase">Institutional Leaders</p>
          </div>

          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
            {performance.map((emp, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-6 p-6 transition-all hover:bg-orange-50/30 relative"
              >
                {/* Visual indicator for Rank 1 */}
                {idx === 0 && (
                  <div className="absolute bottom-2 left-4 w-[73%] h-1 bg-[#14B8A6] rounded-lg"></div>
                )}

                {/* Avatar/Rank Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm ${idx === 0
                      ? "bg-[#F59E0B33] text-[#D97706]"
                      : idx === 1
                        ? "bg-[#94A3B833] text-[#64748B]"
                        : idx === 2
                          ? "bg-[#FB923C33] text-[#C2410C]"
                          : "bg-[#E2E8F0] text-[#64748B]"
                    }`}
                >
                  {emp.rank <= 3 ? (
                    <span className="text-lg">{emp.rank === 1 ? '🥇' : emp.rank === 2 ? '🥈' : '🥉'}</span>
                  ) : (
                    emp.rank
                  )}
                </div>

                {/* Employee Info */}
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-[#0F172A]">
                    {emp.name || "Unknown Agent"}
                  </h4>
                  <p className="text-[10px] font-normal text-[#64748B] mt-0.5 tracking-widest">
                    ID: {emp.employeeId?.slice(-6).toUpperCase() || "N/A"}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <h4
                    className={`text-xl font-extrabold ${idx === 0 ? "text-[#14B8A6]" : "text-[#0F172A]"}`}
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
