import React, { useState, useMemo, useEffect } from "react";
import { Search, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../../api/service";
import Pagination from "../../../components/ui/Pagination";
import ExportPrintModal from "../../../components/admin/ExportPrintModal";
import { useToast } from "../../../components/ui/Toast";

const normalizeCard = (card) => {
  const totalCount = (Number(card.totalMembers ?? card.totalMember) || 0);
  
  return {
    ...card,
    id: card.applicationId || card._id || "",
    applicant:
      [card.firstName, card.middleName, card.lastName]
        .filter(Boolean)
        .join(" ") || "",
    phone: card.contact || "",
    totalMembers: totalCount,
    members: Array.isArray(card.members)
      ? card.members
      : Array.from({ length: totalCount }, (_, i) => ({
          id: i,
        })),
    payment: {
      applicationFee: 160,
      memberAddOns: Math.max(0, totalCount - 4) * 40,
      totalPaid: totalCount <= 4 ? 160 : 160 + (totalCount - 4) * 40,
    },
  status: (() => {
    switch ((card.status || "").toLowerCase()) {
      case "approved":
        return "Verified";
      case "active":
        return "Verified";
      case "verified":
        return "Verified";
      case "pending":
        return "Not verified";
      case "rejected":
        return "Not verified";
      case "expired":
        return "Expired";
      case "exported":
        return "Exported";
      default:
        return card.status || "Not verified";
    }
  })(),
  };
};

const StatusBadge = ({ status }) => {
  let bg = "bg-gray-100";
  let dot = "bg-gray-400";
  let text = "text-gray-600";

  switch (status) {
    case "Verified":
      bg = "bg-[#76DB1E33]";
      dot = "bg-[#76DB1E]";
      text = "text-[#76DB1E]";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-normal ${bg} ${text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};

const ActionButtons = ({ item, navigate }) => {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() =>
          navigate(`/employee/health-card/${item._id || item.id}`)
        }
        className="text-[#F68E5F] hover:text-[#ff6e2b] cursor-pointer transition-colors p-1.5"
      >
        <Eye size={20} />
      </button>
    </div>
  );
};

export default function VerifiedCards() {
  const navigate = useNavigate();
  const { toastWarn } = useToast();

  const [healthCards, setHealthCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await apiService.getHealthCards();
      const raw = Array.isArray(res?.data?.cards)
        ? res.data.cards
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      const normalized = raw.map(normalizeCard);
      // ONLY SHOW VERIFIED CARDS
      setHealthCards(normalized.filter((c) => c.status === "Verified"));
    } catch (err) {
      console.error("[VerifiedCards] Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const processedData = useMemo(() => {
    return healthCards.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        (item.applicant || "").toLowerCase().includes(query) ||
        (item.id || "").toLowerCase().includes(query) ||
        (item.phone || "").includes(query)
      );
    });
  }, [healthCards, searchQuery]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(processedData.map((_, idx) => idx));
    else setSelectedRows([]);
  };

  const handleSelectRow = (globalIndex) => {
    setSelectedRows((prev) =>
      prev.includes(globalIndex)
        ? prev.filter((i) => i !== globalIndex)
        : [...prev, globalIndex],
    );
  };

  const handleExportClick = () => {
    if (selectedRows.length === 0) {
      toastWarn("Please select at least one verified card to export for printing.");
      return;
    }
    setIsExportModalOpen(true);
  };

  const handleExportSuccess = () => {
    setSelectedRows([]);
    fetchCards();
    setIsExportModalOpen(false);
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-170px)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-3 sm:gap-0">
        <h2 className="text-xl font-bold text-[#22333B]">Verified Cards</h2>
        <button
          onClick={handleExportClick}
          className="w-full sm:w-auto px-4 py-2 border border-[#F68E5F] bg-[#ffffff] rounded-lg text-[15px] font-medium text-[#F68E5F] flex items-center justify-center gap-2 transition-colors hover:bg-orange-50"
        >
          Export +
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="relative w-full xl:w-70">
          <input
            type="text"
            placeholder="Search by name, id, phone"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 text-[16px] border border-[#E5E7EB] rounded-full text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]"
          />
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1E1E]"
          />
        </div>
      </div>

      <div className="bg-white border border-[#D9D9D9] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <Loader2 size={32} className="animate-spin text-[#F68E5F] mb-3" />
            <p className="text-sm text-gray-500">Loading Applications…</p>
          </div>
        ) : paginatedData.length > 0 ? (
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="w-full min-w-[820px] text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-[#FFFFFF]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        processedData.length > 0 &&
                        selectedRows.length === processedData.length
                      }
                      className="w-4 h-4 rounded border-[#D1D5DB] border text-[#22333B] focus:ring-[#111827]"
                    />
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-17.5">
                    Sr.no
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B]">
                    Card ID
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] min-w-[180px]">
                    Applicant
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] hidden md:table-cell">
                    Phone
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] text-center hidden lg:table-cell">
                    Members
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] text-right hidden lg:table-cell">
                    Amount
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B]">
                    Status
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-32.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <tr
                      key={index}
                      className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(globalIndex)}
                          onChange={() => handleSelectRow(globalIndex)}
                          className="w-4 h-3 rounded border-[#D1D5DB] text-[#22333B] focus:ring-[#111827]"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B]">
                        {globalIndex + 1}
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">
                        {row.id}
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">
                        {row.applicant}
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap hidden md:table-cell">
                        {row.phone}
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] text-center hidden lg:table-cell">
                        {row.totalMembers ?? ((row.members?.length || 0) + 1)}
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] text-right whitespace-nowrap hidden lg:table-cell">
                        ₹{Number(row.payment?.totalPaid || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-3 px-4">
                        <ActionButtons
                          item={row}
                          navigate={navigate}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 bg-white">
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">
              No Verified Applications Found
            </h3>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
        totalItems={processedData.length}
        pageSizeOptions={[50, 100, 150]}
      />

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportPrintModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          selectedData={selectedRows.map((idx) => processedData[idx])}
          onExportSuccess={handleExportSuccess}
          markPrintedOnDownload={true}
        />
      )}
    </div>
  );
}