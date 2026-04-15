import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, Download, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../../../utils/exportUtils';
import apiService from '../../../api/service';
import { useToast } from '../../../components/ui/Toast';
import Pagination from '../../../components/ui/Pagination';

const ActionButtons = ({ item, navigate, onDelete, basePath }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-21 flex justify-center">
        <button
          onClick={() => navigate(`${basePath}/camps/${item._id || item.id}`, { state: { editMode: true } })}
          className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[#2C2C2C] text-[#FFFCFB] rounded-lg text-sm font-normal hover:bg-[#1F2937]"
        >
          Edit
          <img src="/admin_images/Edit 3.svg" alt="edit" />
        </button>
      </div>
      <div className="flex items-center gap-2">
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

const Camps = ({ basePath = "/admin" }) => {
  const navigate = useNavigate();
  const { toastWarn, toastError } = useToast();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCamps();
  }, [currentPage, itemsPerPage]);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCamps({
        page: currentPage,
        limit: itemsPerPage,
      });
      const raw = Array.isArray(res?.data?.camps)
        ? res.data.camps
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      setCamps(raw);

      const pagination = res?.pagination || res?.data?.pagination || {};
      const total = pagination.total ?? res?.total ?? res?.count ?? res?.data?.total ?? raw.length;
      const pages = pagination.pages ?? (Math.ceil(total / itemsPerPage) || 1);

      setTotalItems(Number(total));
      setTotalPages(Number(pages));
    } catch (err) {
      console.error('Failed to load camps', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        const idToDelete = itemToDelete._id || itemToDelete.id;
        await apiService.deleteCamp(idToDelete);
        setCamps(prev => prev.filter(p => (p._id || p.id) !== idToDelete));
        setSelectedRows([]);
        setItemToDelete(null);
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to delete camp.');
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
    let result = [...(Array.isArray(camps) ? camps : [])].filter(item => {
      const itemName = item.name || '';
      const itemCity = item.city || '';
      const itemState = item.state || '';

      return itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             itemCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
             itemState.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === "asc" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
      });
    }

    return result;
  }, [camps, searchQuery, sortConfig]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData.length > itemsPerPage
    ? processedData.slice(startIndex, startIndex + itemsPerPage)
    : processedData;

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
    exportToCSV(dataToExport, "Camps_Export.csv");
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
    <div className="flex flex-col h-[calc(100vh-170px)] min-h-[560px]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-4 sm:gap-0">
        <h2 className="text-xl font-bold text-[#22333B]">Camps</h2>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none px-4 py-1.5 border border-[#F68E5F] bg-[#FFFCFB] rounded-lg text-[15px] font-medium text-[#F68E5F] hover:bg-[#F68E5F] hover:text-[#FFFCFB] flex items-center justify-center gap-2 transition-colors"
          >
            Export <Download size={16} />
          </button>
          <button
            onClick={() => navigate(`${basePath}/camps/create`)}
            className="flex lg:hidden flex-1 sm:flex-none px-4 py-1.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors items-center justify-center gap-2"
          >
            Add New Camp <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          <div className="relative w-full sm:w-70">
            <input
              type="text"
              placeholder="Search by name, city, state"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-4 pr-10 py-2.5 text-[16px] border border-[#E5E7EB] rounded-full text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1E1E]" />
          </div>
        </div>
        <button
          onClick={() => navigate(`${basePath}/camps/create`)}
          className="hidden lg:flex px-5 py-2.5 bg-[#F68E5F] text-[#FFFCFB] rounded-lg text-[16px] font-medium hover:bg-[#ff6e2b] transition-colors items-center gap-2"
        >
          Add New Camp <Plus size={16} />
        </button>
      </div>

      <div className="bg-white border border-[#D9D9D9] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12 text-[#6B7280]">
            <div className="w-10 h-10 border-4 border-[#F68E5F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-17.5">Sr.no</th>
                  {renderSortableHeader('Name', 'name', 'left', 'min-w-[180px]')}
                  {renderSortableHeader('City', 'city', 'left', 'w-[150px]')}
                  {renderSortableHeader('State', 'state', 'left', 'w-[150px]')}
                  {renderSortableHeader('Date', 'date', 'left', 'w-[150px]')}
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-32.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  const isChecked = selectedRows.includes(globalIndex);
                  return (
                    <tr key={index} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(globalIndex)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#22333B] focus:ring-[#111827]"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B]">{globalIndex + 1}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.name}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.city}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.state}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">
                         {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <ActionButtons item={row} navigate={navigate} onDelete={setItemToDelete} basePath={basePath} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#6B7280]">
            <p className="text-lg font-bold text-[#22333B] mb-1">No camp found</p>
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
              Do you really want to delete the camp <strong>{itemToDelete.name}</strong>? This process cannot be undone.
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

export default Camps;
