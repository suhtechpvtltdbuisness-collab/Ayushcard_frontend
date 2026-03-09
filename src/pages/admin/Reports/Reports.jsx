import React, { useState, useEffect } from "react";
import { FileText, Clock } from "lucide-react";
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

// --- Dummy Data ---
const statusData = [
  { name: "Verified", value: 8920, color: "#feceac" }, // Light orange
  { name: "Non-Verified", value: 2614, color: "#fb7312" }, // Dark orange
  { name: "Expiring Soon", value: 1313, color: "#ffaf78" }, // Base orange
];

const baseNewCardsData = {
  Daily: [
    { name: "Mon", cards: 45 },
    { name: "Tue", cards: 52 },
    { name: "Wed", cards: 38 },
    { name: "Thu", cards: 65 },
    { name: "Fri", cards: 80 },
    { name: "Sat", cards: 110 },
    { name: "Sun", cards: 140 },
  ],
  Weekly: [
    { name: "Week 1", cards: 320 },
    { name: "Week 2", cards: 450 },
    { name: "Week 3", cards: 410 },
    { name: "Week 4", cards: 580 },
  ],
  Monthly: [
    { name: "Sep", cards: 400 },
    { name: "Oct", cards: 500 },
    { name: "Nov", cards: 945 },
    { name: "Dec", cards: 800 },
    { name: "Jan", cards: 1200 },
    { name: "Feb", cards: 2100 },
  ],
  Yearly: [
    { name: "2020", cards: 1200 },
    { name: "2021", cards: 3500 },
    { name: "2022", cards: 5800 },
    { name: "2023", cards: 8400 },
    { name: "2024", cards: 12500 },
  ],
};

const ageData = [
  { name: "0-12", value: 950 },
  { name: "13-18", value: 2400 },
  { name: "19-30", value: 1600 },
  { name: "31-45", value: 1800 },
  { name: "46-60", value: 800 },
  { name: "61-75", value: 1100 },
  { name: "75+", value: 500 },
];

const genderData = [
  { name: "Male", value: 6732, percent: "52.4%", color: "#ffaf78" }, // Light orange
  { name: "Female", value: 5814, percent: "45.3%", color: "#feefe2" }, // Base orange
  { name: "Other", value: 301, percent: "2.3%", color: "#fb7312" }, // Dark orange
];

const locationData = [
  { name: "Lucknow", value: 3200, max: 3400 },
  { name: "Kanpur", value: 2900, max: 3400 },
  { name: "Varanasi", value: 1900, max: 3400 },
  { name: "Agra", value: 1750, max: 3400 },
  { name: "Prayagraj", value: 1200, max: 3400 },
  { name: "Ghaziabad", value: 1100, max: 3400 },
  { name: "Meerut", value: 900, max: 3400 },
  { name: "Noida", value: 400, max: 3400 },
];

const topCitiesData = [
  { name: "Mumbai", value: 3240, max: 3500 },
  { name: "Pune", value: 2810, max: 3500 },
  { name: "Nashik", value: 1920, max: 3500 },
  { name: "Nagpur", value: 1650, max: 3500 },
  { name: "Aurangabad", value: 1220, max: 3500 },
  { name: "Solapur", value: 980, max: 3500 },
];

const employeeData = [
  { name: "Priya S.", value: 342, region: "Field North", max: 400 },
  { name: "Arjun M.", value: 298, region: "Field South", max: 400 },
  { name: "Sneha K.", value: 276, region: "Field East", max: 400 },
  { name: "Rahul P.", value: 251, region: "Field West", max: 400 },
  { name: "Meena T.", value: 234, region: "Field Central", max: 400 },
  { name: "Kiran B.", value: 218, region: "Field North", max: 400 },
  { name: "Dev C.", value: 189, region: "Field South", max: 400 },
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

// PDF Export Function
const handleExportPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Custom font size and styles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text("Health Card Analytics Report", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // #64748B
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Generated: ${today}`, pageWidth - 14, 20, { align: "right" });

  doc.setFontSize(10);
  doc.text("Maharashtra Health Authority • FY 2024–25", 14, 26);

  // Draw header line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageWidth - 14, 30);

  let currentY = 40;

  // Helper for Section Titles
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
      ["Total Health Cards Issued", "12,847", "+1,243 issued this month"],
      ["Verified Cards", "8,920", "69.4% of total"],
      ["Pending Verification", "2,614", "Awaiting review"],
      ["Expiring Soon", "1,313", "Within next 30 days"],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [230, 230, 230],
      textColor: [50, 50, 50],
    },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // 2. New Health Cards Issued — Monthly Trend
  addSectionTitle("2. New Health Cards Issued — Monthly Trend");
  const maxMonthly = Math.max(...baseNewCardsData.Monthly.map((d) => d.cards));
  const monthlyBody = baseNewCardsData.Monthly.map((item) => {
    return [item.name, item.cards.toLocaleString(), ""];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Month", "Cards Issued", "Trend"]],
    body: monthlyBody,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [230, 230, 230],
      textColor: [50, 50, 50],
    },
    columnStyles: { 2: { minCellWidth: 70 } },
    didDrawCell: (data) => {
      if (data.column.index === 2 && data.cell.section === "body") {
        const item = baseNewCardsData.Monthly[data.row.index];
        const val = item.cards;
        // fit max 23 blocks dynamically depending on cell width
        const totalBlocks = Math.round(23 * (val / maxMonthly));
        doc.setFillColor(110, 110, 110);
        for (let i = 0; i < totalBlocks; i++) {
          doc.rect(
            data.cell.x + 3 + i * 3.5,
            data.cell.y + data.cell.height / 2 - 1.25,
            2.5,
            2.5,
            "F",
          );
        }
      }
    },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // 3. Cards by Status
  addSectionTitle("3. Cards by Status");
  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0);
  const statusBody = statusData.map((item) => [
    item.name,
    item.value.toLocaleString(),
    ((item.value / totalStatus) * 100).toFixed(1) + "%",
    "",
  ]);
  autoTable(doc, {
    startY: currentY,
    head: [["Status", "Count", "Share (%)", "Distribution"]],
    body: statusBody,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [230, 230, 230],
      textColor: [50, 50, 50],
    },
    columnStyles: { 3: { minCellWidth: 70 } },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.cell.section === "body") {
        const item = statusData[data.row.index];
        const totalBlocks = Math.round(23 * (item.value / totalStatus));
        doc.setFillColor(110, 110, 110);
        for (let i = 0; i < totalBlocks; i++) {
          doc.rect(
            data.cell.x + 3 + i * 3.5,
            data.cell.y + data.cell.height / 2 - 1.25,
            2.5,
            2.5,
            "F",
          );
        }
      }
    },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // 4. Age Group Distribution
  addSectionTitle("4. Age Group Distribution");
  const totalAge = ageData.reduce((sum, item) => sum + item.value, 0);
  const maxAge = Math.max(...ageData.map((d) => d.value));
  const ageBody = ageData.map((item) => [
    item.name,
    item.value.toLocaleString(),
    ((item.value / totalAge) * 100).toFixed(1) + "%",
    "",
  ]);
  autoTable(doc, {
    startY: currentY,
    head: [["Age Group", "Cards Issued", "Share (%)", "Distribution"]],
    body: ageBody,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [230, 230, 230],
      textColor: [50, 50, 50],
    },
    columnStyles: { 3: { minCellWidth: 70 } },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.cell.section === "body") {
        const item = ageData[data.row.index];
        const totalBlocks = Math.round(23 * (item.value / maxAge));
        doc.setFillColor(110, 110, 110);
        for (let i = 0; i < totalBlocks; i++) {
          doc.rect(
            data.cell.x + 3 + i * 3.5,
            data.cell.y + data.cell.height / 2 - 1.25,
            2.5,
            2.5,
            "F",
          );
        }
      }
    },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // 5. Gender-wise Distribution
  addSectionTitle("5. Gender-wise Distribution");
  const maxGender = Math.max(...genderData.map((d) => d.value));
  const genderBody = genderData.map((item) => [
    item.name,
    item.value.toLocaleString(),
    item.percent,
    "",
  ]);
  autoTable(doc, {
    startY: currentY,
    head: [["Gender", "Cards Issued", "Share (%)", "Distribution"]],
    body: genderBody,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [230, 230, 230],
      textColor: [50, 50, 50],
    },
    columnStyles: { 3: { minCellWidth: 70 } },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.cell.section === "body") {
        const item = genderData[data.row.index];
        const totalBlocks = Math.round(23 * (item.value / maxGender));
        doc.setFillColor(110, 110, 110);
        for (let i = 0; i < totalBlocks; i++) {
          doc.rect(
            data.cell.x + 3 + i * 3.5,
            data.cell.y + data.cell.height / 2 - 1.25,
            2.5,
            2.5,
            "F",
          );
        }
      }
    },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // 6. Location-wise Distribution
  addSectionTitle("6. Location-wise Distribution");
  const combinedLocations = [
    { name: "Mumbai", value: 3240 },
    { name: "Pune", value: 2810 },
    { name: "Nashik", value: 1920 },
    { name: "Nagpur", value: 1650 },
    { name: "Aurangabad", value: 1220 },
    { name: "Solapur", value: 980 },
    { name: "Kolhapur", value: 760 },
    { name: "Thane", value: 267 },
  ];
  const maxLoc = combinedLocations[0].value;
  const totalLoc = 12847; // approx total matching design
  const locBody = combinedLocations.map((item, idx) => [
    idx + 1,
    item.name,
    item.value.toLocaleString(),
    ((item.value / totalLoc) * 100).toFixed(1) + "%",
    "",
  ]);
  autoTable(doc, {
    startY: currentY,
    head: [
      ["Rank", "City / District", "Cards Issued", "Share (%)", "Distribution"],
    ],
    body: locBody,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [230, 230, 230],
      textColor: [50, 50, 50],
    },
    columnStyles: { 4: { minCellWidth: 70 } },
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.cell.section === "body") {
        const item = combinedLocations[data.row.index];
        const totalBlocks = Math.round(23 * (item.value / maxLoc));
        doc.setFillColor(110, 110, 110);
        for (let i = 0; i < totalBlocks; i++) {
          doc.rect(
            data.cell.x + 3 + i * 3.5,
            data.cell.y + data.cell.height / 2 - 1.25,
            2.5,
            2.5,
            "F",
          );
        }
      }
    },
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // 7. Field Employee Performance
  addSectionTitle("7. Field Employee Performance");
  const empList = [
    { name: "Priya S.", dept: "Field North", value: 342, rank: 1 },
    { name: "Arjun M.", dept: "Field South", value: 298, rank: 2 },
    { name: "Sneha K.", dept: "Field East", value: 276, rank: 3 },
    { name: "Rahul P.", dept: "Field West", value: 251, rank: 4 },
    { name: "Meena T.", dept: "Field North", value: 234, rank: 5 },
    { name: "Kiran B.", dept: "Field South", value: 218, rank: 6 },
    { name: "Anjali R.", dept: "Field Central", value: 205, rank: 7 },
    { name: "Dev C.", dept: "Field East", value: 189, rank: 8 },
    { name: "Lata N.", dept: "Field West", value: 176, rank: 9 },
    { name: "Suresh V.", dept: "Field Central", value: 162, rank: 10 },
  ];

  const empBody = empList.map((item) => [
    item.rank,
    item.name,
    item.dept,
    item.value.toLocaleString(),
    Math.round((item.value / 342) * 100) + "%",
    "",
  ]);
  autoTable(doc, {
    startY: currentY,
    head: [
      ["Rank", "Employee", "Department", "Cards", "% of Top", "Performance"],
    ],
    body: empBody,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [230, 230, 230],
      textColor: [50, 50, 50],
    },
    columnStyles: { 5: { minCellWidth: 70 } },
    didDrawCell: (data) => {
      if (data.column.index === 5 && data.cell.section === "body") {
        const item = empList[data.row.index];
        const totalBlocks = Math.round(23 * (item.value / 342));
        doc.setFillColor(110, 110, 110);
        for (let i = 0; i < totalBlocks; i++) {
          doc.rect(
            data.cell.x + 3 + i * 3.5,
            data.cell.y + data.cell.height / 2 - 1.25,
            2.5,
            2.5,
            "F",
          );
        }
      }
    },
  });

  // Footer for all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 285, pageWidth - 14, 285);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Maharashtra Health Authority • Health Card Analytics • FY 2024–25 • Confidential",
      14,
      290,
    );
    doc.text(`Page ${i}`, pageWidth - 14, 290, { align: "right" });
  }

  doc.save("Health_Card_Analytics_Report_FY24-25.pdf");
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
  const [barTooltip, setBarTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });
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

  const filteredCardsData = baseNewCardsData[timeFilter];
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
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">2,847</h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            <span className="text-lg">↑</span> 12.5% this month
          </p>
        </div>

        {/* Active Members */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            ACTIVE MEMBERS
          </p>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">8,421</h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            <span className="text-lg">↑</span> 8.3% this month
          </p>
        </div>

        {/* Verified Cards */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#06B6D4]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            VERIFIED CARDS
          </p>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">2,654</h2>
          <p className="text-sm font-semibold text-[#10B981] flex items-center gap-1">
            <span className="text-lg">↑</span> 93.2% verified
          </p>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1]"></div>
          <p className="text-xs font-bold text-[#64748B] tracking-wider mb-3 uppercase">
            EXPIRING SOON
          </p>
          <h2 className="text-3xl font-extrabold text-[#0F172A] mb-3">186</h2>
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
            Verified • Non-verified • Expiring
          </p>

          <div className="flex-1 relative min-h-[220px] mb-8 flex items-center justify-center">
            <CustomDonutChart
              data={[
                statusData[0], // Light orange
                statusData[2], // Base orange
                statusData[1], // Dark orange
              ]}
              total={12847}
              renderCenter={() => (
                <>
                  <span className="text-3xl font-extrabold text-[#0F172A]">
                    12.8k
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
            {statusData.map((item, idx) => (
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
                    {((item.value / 12847) * 100).toFixed(1)}%
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
                Last 6 months • 6,198 cards
              </p>
            </div>
            <div className="flex bg-[#F8FAFC] rounded-lg p-1 border border-gray-100">
              {["Daily", "Weekly", "Monthly", "Yearly"].map((period) => (
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
                CARDS THIS MONTH
              </p>
              <p className="text-2xl font-bold text-[#0C4A6E]">1,243</p>
            </div>
            <div className="bg-[#ECFDF5] rounded-[16px] p-4 border border-[#D1FAE5]">
              <p className="text-[10px] font-bold text-[#059669] uppercase tracking-widest mb-1">
                GROWTH
              </p>
              <p className="text-2xl font-bold text-[#064E3B]">+18.4%</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-[16px] p-4 border border-[#F1F5F9]">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">
                PERIOD TOTAL
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">6,198</p>
            </div>
          </div>

          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredCardsData}
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
              Health cards issued by age bracket
            </p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageData}
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
                <Bar
                  dataKey="value"
                  fill="#F97316"
                  radius={[6, 6, 6, 6]}
                  barSize={32}
                  onMouseMove={(data, index, e) => {
                    const evt = e || index;
                    if (evt && evt.clientX) {
                      const container = evt.currentTarget.closest(
                        "[data-age-chart-container]",
                      );
                      if (container) {
                        const rect = container.getBoundingClientRect();
                        setBarTooltip({
                          visible: true,
                          x: evt.clientX - rect.left,
                          y: Math.min(evt.clientY - rect.top, 250),
                          data: data,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() =>
                    setBarTooltip({ visible: false, x: 0, y: 0, data: null })
                  }
                />
              </BarChart>
            </ResponsiveContainer>

            {barTooltip.visible && (barTooltip.data || barTooltip.data?.payload) && (
              <div
                className="absolute z-10 bg-[#FFFFFF] px-3 py-2 rounded-lg shadow-xl pointer-events-none"
                style={{
                  left: barTooltip.x,
                  top: barTooltip.y,
                  transform: "translate(-50%, -100%)",
                  marginTop: "-10px",
                }}
              >
                <p className="text-[#64748B] text-xs font-bold">
                  {barTooltip.data?.name || barTooltip.data?.payload?.name || "N/A"}
                </p>
                <p className="text-[#F97316] text-sm font-bold">
                  {((barTooltip.data?.value !== undefined
                    ? barTooltip.data.value
                    : barTooltip.data?.payload?.value) || 0).toLocaleString()}{" "}
                  cards
                </p>
              </div>
            )}
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
            Health cards issued across districts / cities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left side: Main Districts */}
          <div className="space-y-5">
            {locationData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6">
                <span className="w-20 text-xs text-[#64748B] font-medium text-right">
                  {item.name}
                </span>
                <div className="flex-1 h-[24px] bg-[#F1F5F9] rounded-r-lg overflow-hidden flex items-center relative isolation-auto border-l-0">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#F97316] rounded-r-lg transition-all duration-1000 ease-out cursor-pointer hover:brightness-110"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                    onMouseMove={(e) =>
                      handleGenericMouseMove(
                        e,
                        item.name,
                        `${item.value.toLocaleString()} cards`,
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
            {topCitiesData.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 group">
                <div className="flex justify-between items-end mb-0.5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-[11px] font-extrabold shadow-sm group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-[#1E293B]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#1E293B]">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 ml-9 relative"
                  style={{ width: "calc(100% - 36px)" }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-[#F1F5F9] rounded-full"></div>
                  <div
                    className="absolute top-0 left-0 h-full bg-[#F97316] rounded-l-full transition-all duration-1000 ease-out cursor-pointer hover:brightness-110"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                    onMouseMove={(e) =>
                      handleGenericMouseMove(
                        e,
                        item.name,
                        `${item.value.toLocaleString()} cards`,
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
              {employeeData.map((item, idx) => (
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
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                      onMouseMove={(e) =>
                        handleGenericMouseMove(
                          e,
                          item.name,
                          `${item.value.toLocaleString()} cards`,
                        )
                      }
                      onMouseLeave={handleGenericMouseLeave}
                    >
                      <span className="text-xs font-bold text-white shadow-xs pointer-events-none">
                        {item.value}
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
              {employeeData.slice(0, 4).map((emp, idx) => (
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
                      {emp.region}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <h4
                      className={`text-xl font-extrabold ${idx > 0 ? "text-[#0F172A]" : "text-[#14B8A6]"}`}
                    >
                      {emp.value}
                    </h4>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 mb-1">
                      {Math.round((emp.value / 342) * 100)}% OF TOP
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
