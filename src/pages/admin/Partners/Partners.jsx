import React, { useState, useMemo } from 'react';
import { Search, Plus, Eye, Trash2, Download, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../../../utils/exportUtils';
import apiService from '../../../api/service';

// getPartners removed as it was unused and causing lint errors.
// Component now uses apiService directly.

const ActionButtons = ({ item, navigate, onDelete }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-21 flex justify-center">
        <button
          onClick={() => navigate(`/admin/partners/${item._id || item.id}`, { state: { editMode: true } })}
          className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[#2C2C2C] text-[#FFFCFB] rounded-lg text-sm font-normal hover:bg-[#1F2937]"
        >
          Edit
          <img src="/admin_images/Edit 3.svg" alt="edit" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/admin/partners/${item._id || item.id}`)}
          className="text-[#F68E5F] hover:text-[#ff6e2b] cursor-pointer transition-colors p-1.5"
        >
          <Eye size={20} />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="text-[#F68E5F] hover:text-[#ff6e2b] transition-colors p-1.5"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const ITEMS_PER_PAGE = 6;

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
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        const idToDelete = itemToDelete._id || itemToDelete.id;
        await apiService.deleteOrganization(idToDelete);
        setPartners(prev => prev.filter(p => (p._id || p.id) !== idToDelete));
        setSelectedRows([]);
        setItemToDelete(null);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete partner.');
      }
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
    let result = [...(Array.isArray(partners) ? partners : [])].filter(item => {
      const itemName = item.name || item.orgName || '';
      const itemId = item._id || item.id || item.partnerId || '';
      const itemContact = item.contact || item.primaryContact || '';

      const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemContact.includes(searchQuery);

      return matchesSearch;
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
  }, [partners, searchQuery, sortConfig]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const renderPaginationButtons = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return pages.map((page, idx) =>
      page === "..." ? (
        <span
          key={idx}
          className="w-7 h-7 flex items-center justify-center text-[#9CA3AF]"
        >
          ...
        </span>
      ) : (
        <button
          key={idx}
          onClick={() => setCurrentPage(page)}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-[#374151] text-[#FFFCFB]' : 'text-[#4B5563] hover:bg-gray-100'
            }`}
        >
          {page}
        </button>
      ),
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(processedData.map((_, idx) => idx));
    } else {
      setSelectedRows([]);
    }
  };

  const handleExport = () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one item to export.");
      return;
    }
    const dataToExport = selectedRows.map((index) => processedData[index]);
    exportToCSV(dataToExport, "Partners_Export.csv");
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
      className="flex flex-col h-[calc(100vh-170px)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-4 sm:gap-0">
        <h2 className="text-xl font-bold text-[#22333B]">Partners</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="px-4 py-1.5 border border-[#F68E5F] bg-[#FFFCFB] rounded-lg text-[15px] font-medium text-[#F68E5F] hover:bg-[#F68E5F] hover:text-[#FFFCFB] flex items-center gap-2 transition-colors"
          >
            Export <Download size={16} />
          </button>
          {/* Create Button (Tablet/Mobile Only) */}
          <button
            onClick={() => navigate('/admin/partners/create')}
            className="flex lg:hidden px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors items-center gap-2"
          >
            Add New Partner <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          {/* Search */}
          <div className="relative w-70">
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

        {/* Create Button (Desktop only) */}
        <button
          onClick={() => navigate('/admin/partners/create')}
          className="hidden lg:flex px-5 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[16px] font-medium hover:bg-[#ff6e2b] transition-colors items-center gap-2"
        >
          Add New Partner <Plus size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9D9D9] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12 text-[#6B7280]">
            <div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          </div>
        ) : paginatedData.length > 0 ? (
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse relative">
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
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-17.5">Sr.no</th>
                  {renderSortableHeader('Partner ID', '_id', 'left', 'w-[130px]')}
                  {renderSortableHeader('Type', 'type', 'left', 'w-[160px]')}
                  {renderSortableHeader('Org Name', 'name', 'left', 'min-w-[180px]')}
                  {renderSortableHeader('Primary Contact', 'contact', 'left', 'w-[150px]')}
                  {renderSortableHeader('Location', 'location', 'left', 'w-[150px]')}
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-32.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  const isChecked = selectedRows.includes(globalIndex);
                  return (
                    <tr
                      key={index}
                      className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(globalIndex)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#22333B] focus:ring-[#111827]"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B]">{globalIndex + 1}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{(row.partnerId || row._id || row.id || '').substring(0, 10)}...</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.type || 'Hospital'}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.name || row.orgName}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.contact || row.primaryContact}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.location}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <ActionButtons
                          item={row}
                          navigate={navigate}
                          onDelete={setItemToDelete}
                        />
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
              <img src="/admin_images/partner.svg" alt="not record found" className="w-20 h-20" />
            </div>
            <p className="text-lg font-bold text-[#22333B] mb-1">
              No such partner found
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center px-2 py-4 relative mt-2 shrink-0">
        <span className="absolute left-0 text-sm font-medium text-[#4B5563]">
          Showing {processedData.length > 0 ? startIndex + 1 : 0} -{" "}
          {Math.min(startIndex + ITEMS_PER_PAGE, processedData.length)} of{" "}
          {processedData.length}
        </span>
        <div className="flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-2 py-1 flex items-center gap-1 ${currentPage === 1 ? "text-[#D1D5DB] cursor-not-allowed" : "text-[#4B5563] hover:text-[#22333B]"}`}
          >
            &larr; Previous
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 flex items-center gap-1 ${currentPage === totalPages ? "text-[#D1D5DB] cursor-not-allowed" : "text-[#4B5563] hover:text-[#22333B]"}`}
          >
            Next &rarr;
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-100 shadow-lg animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#22333B]">Are you sure?</h3>
            </div>
            <p className="text-[#4B5563] text-sm mb-6 pl-12 line-clamp-3">
              Do you really want to delete the partner <strong>{itemToDelete.name || itemToDelete.orgName}</strong> ({itemToDelete._id || itemToDelete.id})? This process cannot be undone.
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

export default Partners;
