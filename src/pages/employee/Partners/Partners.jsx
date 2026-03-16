import React, { useState, useMemo } from "react";
import { Search, Plus, Eye, Trash2, Download, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../../api/service";
import Pagination from "../../../components/ui/Pagination";

const ActionButtons = ({ item, navigate }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(`/employee/partners/${item._id || item.id}`)}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-sm font-medium hover:bg-[#ff6e2b] transition-colors shadow-sm"
      >
        <Eye size={18} />
        View Details
      </button>
    </div>
  );
};

const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await apiService.getOrganizations();
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res?.data?.organizations && Array.isArray(res.data.organizations)) {
        list = res.data.organizations;
      } else if (res?.data && Array.isArray(res.data)) {
        list = res.data;
      } else if (res?.organizations && Array.isArray(res.organizations)) {
        list = res.organizations;
      }
      setPartners(list);
    } catch (err) {
      console.error("Failed to load partners", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let result = [...(Array.isArray(partners) ? partners : [])].filter((item) => {
      const itemName = item.name || item.orgName || "";
      const itemId = item._id || item.id || item.partnerId || "";
      const itemContact = item.contact || item.primaryContact || "";

      const matchesSearch =
        itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemContact.includes(searchQuery);

      return matchesSearch;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === undefined) aValue = "";
        if (bValue === undefined) bValue = "";

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        } else {
          if (aValue < bValue) comparison = -1;
          else if (aValue > bValue) comparison = 1;
        }

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [partners, searchQuery, sortConfig]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderPaginationButtons = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
      }
    }

    return pages.map((page, idx) =>
      page === "..." ? (
        <span key={idx} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF]">
          ...
        </span>
      ) : (
        <button
          key={idx}
          onClick={() => setCurrentPage(page)}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
            currentPage === page ? "bg-[#374151] text-[#FFFCFB]" : "text-[#4B5563] hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      )
    );
  };

  const renderSortableHeader = (title, sortKey, align = "left", className = "") => (
    <th className={`py-3 px-4 text-sm font-semibold text-[#22333B] whitespace-nowrap ${className}`}>
      <div
        className={`flex items-center gap-1 cursor-pointer hover:text-gray-600 ${
          align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"
        }`}
        onClick={() => handleSort(sortKey)}
      >
        {title}
        <ArrowUpDown
          size={14}
          className={`shrink-0 ${sortConfig.key === sortKey ? "text-[#F68E5F]" : "text-[#22333B]"}`}
        />
      </div>
    </th>
  );

  return (
    <div className="flex flex-col min-w-0 h-[calc(100vh-170px)] min-h-[560px]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-4 sm:gap-0">
        <h2 className="text-xl font-bold text-[#22333B]">Partners</h2>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          <div className="relative w-full sm:w-70">
            <input
              type="text"
              placeholder="Search by name, id, phone"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 text-[16px] border border-[#E5E7EB] rounded-full text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1E1E]" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9D9D9] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12 text-[#6B7280]">
            <div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          </div>
        ) : paginatedData.length > 0 ? (
          <>
            <div className="lg:hidden flex-1 overflow-y-auto p-3 space-y-3">
              {paginatedData.map((row, index) => (
                <div key={index} className="border border-[#E5E7EB] rounded-xl p-3 bg-white">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-xs text-[#6B7280]">Partner ID</p>
                      <p className="text-sm font-semibold text-[#22333B] truncate">
                        {row.partnerId || row._id || row.id || "—"}
                      </p>
                    </div>
                    <span className="text-xs bg-[#FFF4ED] text-[#F68E5F] px-2 py-1 rounded-full">
                      {row.type || "Hospital"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-xs text-[#6B7280]">Organization</p>
                      <p className="text-[#22333B] truncate" title={row.name || row.orgName}>{row.name || row.orgName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Contact</p>
                      <p className="text-[#22333B]">{row.contact || row.primaryContact || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-[#6B7280]">Location</p>
                      <p className="text-[#22333B] truncate" title={row.location}>{row.location || "—"}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <ActionButtons item={row} navigate={navigate} />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-y-auto overflow-x-auto flex-1">
              <table className="min-w-[960px] w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-[#FFFFFF]">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-17.5">Sr.no</th>
                  {renderSortableHeader("Partner ID", "_id", "left", "w-[130px]")}
                  {renderSortableHeader("Type", "type", "left", "w-[160px]")}
                  {renderSortableHeader("Org Name", "name", "left", "min-w-[180px]")}
                  {renderSortableHeader("Primary Contact", "contact", "left", "w-[150px]")}
                  {renderSortableHeader("Location", "location", "left", "w-[150px]")}
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-32.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <tr key={index} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B]">{globalIndex + 1}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">
                        {row.partnerId || row._id || row.id || ""}
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.type || "Hospital"}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.name || row.orgName}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.contact || row.primaryContact}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B]">
                        <div className="max-w-[150px] truncate" title={row.location}>
                          {row.location}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <ActionButtons item={row} navigate={navigate} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#6B7280]">
            <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-6">
              <img src="/admin_images/partner.svg" alt="not record found" className="w-20 h-20" />
            </div>
            <p className="text-lg font-bold text-[#22333B] mb-1">No such partner found</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onItemsPerPageChange={() => {}}
        totalItems={processedData.length}
      />
    </div>
  );
};

export default Partners;
