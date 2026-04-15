import React, { useState, useMemo, useEffect } from "react";
import { Search, Eye, Trash2, Download, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exportToCSV } from "../../../utils/exportUtils";
import { useToast } from "../../../components/ui/Toast";
import apiService from "../../../api/service";
import Pagination from "../../../components/ui/Pagination";

const ActionButtons = ({ item, navigate, onDelete }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(`/admin/donations/${item.id}`)}
        className="text-[#F68E5F] hover:text-[#ff7535] cursor-pointer transition-colors p-1.5"
      >
        <Eye size={20} />
      </button>
      <button
        onClick={() => onDelete(item)}
        className="text-[#F68E5F] hover:text-[#ff7535] transition-colors p-1.5"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

const Donations = () => {
  const navigate = useNavigate();
  const { toastWarn, toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDonations();
  }, [locationFilter, dateRangeFilter, currentPage, itemsPerPage]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await apiService.getDonations({
        page: currentPage,
        limit: itemsPerPage,
        location: locationFilter !== "All Status" ? locationFilter : undefined,
      });
      // Map backend fields to frontend fields for compatibility
      const raw = res?.data?.donations || res?.donations || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      const mappedData = raw.map(item => ({
        ...item,
        id: item.enquiryId || item._id, // Use enquiryId as display ID
        time: item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')
      }));
      setDonations(mappedData);

      const pagination = res?.pagination || res?.data?.pagination || {};
      const total = pagination.total ?? res?.total ?? res?.count ?? res?.data?.total ?? mappedData.length;
      const pages = pagination.pages ?? (Math.ceil(total / itemsPerPage) || 1);

      setTotalItems(Number(total));
      setTotalPages(Number(pages));
    } catch (error) {
      console.error("Fetch donations error:", error);
      toastError("Failed to load donation enquiries.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const updatedData = donations.filter((d) => d.id !== itemToDelete.id);
      setDonations(updatedData);
      localStorage.setItem("donations_data", JSON.stringify(updatedData));
      setSelectedRows([]);
      setItemToDelete(null);
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
    let result = [...donations].filter(item => {
      const name = item.name || "";
      const id = item.id || "";
      const contact = item.contact || "";

      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.includes(searchQuery);

      const matchesLocation = locationFilter ? item.location === locationFilter : true;

      // Dynamic Date Filtering
      let matchesDate = true;
      if (dateRangeFilter) {
        const itemDate = new Date(item.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateRangeFilter === "today") {
          matchesDate = itemDate.toDateString() === now.toDateString();
        } else if (dateRangeFilter === "week") {
          matchesDate = diffDays <= 7;
        } else if (dateRangeFilter === "month") {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesLocation && matchesDate;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === undefined) aValue = '';
        if (bValue === undefined) bValue = '';

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
  }, [donations, searchQuery, sortConfig, locationFilter, dateRangeFilter]);

  // totalPages is now managed via state from backend response
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.length > itemsPerPage
    ? processedData.slice(startIndex, startIndex + itemsPerPage)
    : processedData;

  // renderPaginationButtons removed as it's now handled by the Pagination component.

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(processedData.map((_, idx) => idx));
    } else {
      setSelectedRows([]);
    }
  };

  const handleExport = () => {
    if (selectedRows.length === 0) {
      toastWarn("Please select at least one item to export.");
      return;
    }
    const dataToExport = selectedRows.map((index) => processedData[index]);
    exportToCSV(dataToExport, "Donations_Export.csv");
  };

  const handleSelectRow = (globalIndex) => {
    setSelectedRows(prev =>
      prev.includes(globalIndex)
        ? prev.filter(i => i !== globalIndex)
        : [...prev, globalIndex]
    );
  };

  const renderSortableHeader = (title, sortKey, align = 'left', className = '') => (
    <th className={`py-3 px-4 text-sm font-semibold text-[#22333B] whitespace-nowrap ${className}`}>
      <div
        className={`flex items-center gap-1 cursor-pointer hover:text-gray-600 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}
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
    <div
      className="flex flex-col h-[calc(100vh-170px)] min-h-[560px]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-4 sm:gap-0">
        <h2 className="text-xl font-bold text-[#22333B]">Donation Enquiries</h2>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-1.5 border border-[#F68E5F] bg-[#FFFCFB] rounded-lg text-[15px] font-medium text-[#F68E5F] hover:bg-[#F68E5F] hover:text-[#FFFCFB] flex items-center justify-center gap-2 transition-colors"
        >
          Export <Download size={16} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-4">
        <div className="flex items-stretch sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row flex-wrap flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-70">
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

          {/* Location Dropdown */}
          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 border border-[#ff7535] rounded-lg text-[16px] bg-[#F68E5F] text-[#FFFCFB] focus:outline-none focus:border-[#F68E5F]"
          >
            <option value="">Location</option>
            <option value="Kanpur,UP">Kanpur,UP</option>
            <option value="Noida,UP">Noida,UP</option>
            <option value="Delhi">Delhi</option>
            <option value="Lucknow,UP">Lucknow,UP</option>
          </select>

          {/* Date Range Dropdown */}
          <select
            value={dateRangeFilter}
            onChange={(e) => {
              setDateRangeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 border border-[#ff7535] rounded-lg text-[16px] bg-[#F68E5F] text-[#FFFCFB] focus:outline-none focus:border-[#F68E5F]"
          >
            <option value="">Select Date range</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9D9D9] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#6B7280]">Loading enquiries...</p>
          </div>
        ) : paginatedData.length > 0 ? (
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="min-w-[980px] w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 bg-[#FFFFFF]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={processedData.length > 0 && selectedRows.length === processedData.length}
                      className="w-4 h-4 rounded border-[#D1D5DB] border text-[#22333B] focus:ring-[#111827]"
                    />
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-17.5 text-center">Sr.no</th>
                  {renderSortableHeader('Enquiry ID', 'id', 'center', 'w-[140px]')}
                  {renderSortableHeader('Name', 'name', 'center', 'min-w-[140px]')}
                  {renderSortableHeader('Contact', 'contact', 'center', 'w-[140px]')}
                  {renderSortableHeader('Date', 'date', 'center', 'w-[120px]')}
                  {renderSortableHeader('Time', 'time', 'center', 'w-[110px]')}
                  {renderSortableHeader('Location', 'location', 'center', 'w-[140px]')}
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  const isChecked = selectedRows.includes(globalIndex);
                  return (
                    <tr key={index} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-2 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(globalIndex)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#22333B] focus:ring-[#111827]"
                        />
                      </td>
                      <td className="py-2 px-4 text-sm font-normal text-[#22333B] text-center">{globalIndex + 1}</td>
                      <td className="py-2 px-4 text-sm font-normal text-[#22333B] text-center whitespace-nowrap">{row.id}</td>
                      <td className="py-2 px-4 text-sm font-normal text-[#22333B] text-center">
                        <div className="max-w-[140px] truncate mx-auto" title={row.name}>
                          {row.name}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-sm font-normal text-[#22333B] text-center">{row.contact}</td>
                      <td className="py-2 px-4 text-sm font-normal text-[#22333B] text-center">{row.date}</td>
                      <td className="py-2 px-4 text-sm font-normal text-[#22333B] text-center">{row.time}</td>
                      <td className="py-2 px-4 text-sm font-normal text-[#22333B] text-center">
                        <div
                          className="max-w-[140px] truncate mx-auto"
                          title={row.location}
                        >
                          {row.location}
                        </div>
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <ActionButtons item={row} navigate={navigate} onDelete={setItemToDelete} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#6B7280]">
            <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-6">
              <img src="/admin_images/donations.svg" alt="not record found" className="w-14 h-14" />
            </div>
            <p className="text-lg font-bold text-[#22333B] mb-1">
              No enquiry found
            </p>
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
        totalItems={totalItems}
      />

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-100 shadow-lg animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#22333B]">Are you sure?</h3>
            </div>
            <p className="text-[#4B5563] text-sm mb-6 pl-12 line-clamp-3">
              Do you really want to delete the enquiry from{" "}
              <strong>{itemToDelete.name}</strong> ({itemToDelete.id})? This
              process cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-sm font-medium hover:bg-[#ff702d] transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
