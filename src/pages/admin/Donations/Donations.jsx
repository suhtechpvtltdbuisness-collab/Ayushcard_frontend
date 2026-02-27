import React, { useState, useMemo } from 'react';
import { Search, Eye, Trash2, Download, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../../../utils/exportUtils';

export const getDonations = () => {
  const stored = localStorage.getItem('donations_data');
  if (stored) {
    const parsed = JSON.parse(stored);
    // If it has too many items from previous test, regenerate it
    if (parsed.length <= 25) return parsed;
  }
  
  const initialData = Array.from({ length: 14 }).map((_, i) => {
    const names = ['Vibha Singh', 'Renu Verma', 'Amit Kumar', 'Sneha Sharma', 'Rahul Gupta', 'Priya Desai', 'Anil Mehta', 'Sunita Rao'];
    const locations = ['Kanpur,UP', 'Noida,UP', 'Delhi', 'Lucknow,UP', 'Kanpur,UP', 'Delhi'];
    const dates = ['10-02-2026', '12-02-2026', '15-02-2026', '18-02-2026', '20-02-2026'];
    const times = ['10:30 AM', '11:15 AM', '02:00 PM', '04:45 PM', '09:00 AM'];
    
    return {
      id: `P-${1001456 + i}`,
      name: names[i % names.length],
      contact: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `${names[i % names.length].split(' ')[0].toLowerCase()}@example.com`,
      date: dates[i % dates.length],
      time: times[i % times.length],
      location: locations[i % locations.length],
      message: 'Lorem ipsum dolor sit amet consectetur. Scelerisque quis nullam sagittis diam eu at est scelerisque. Facilisis ipsum augue ante quam. Consectetur aenean sit condimentum senectus lacus placerat. Condimentum volutpat dolor egestas id imperdiet sagittis nulla vel.'
    };
  });
  localStorage.setItem('donations_data', JSON.stringify(initialData));
  return initialData;
};

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
  const [donations, setDonations] = useState(getDonations());
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const ITEMS_PER_PAGE = 10;

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const updatedData = donations.filter(d => d.id !== itemToDelete.id);
      setDonations(updatedData);
      localStorage.setItem('donations_data', JSON.stringify(updatedData));
      setSelectedRows([]);
      setItemToDelete(null);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let result = [...donations].filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.contact.includes(searchQuery);
                            
      const matchesLocation = locationFilter ? item.location === locationFilter : true;
      
      // Basic mock date logic for dateRangeFilter
      // For a real app, you would parse the dates natively. Here we mock it based on selection
      let matchesDate = true;
      if (dateRangeFilter === 'today') {
        matchesDate = item.date === '20-02-2026'; // Mocking today's date based on sample data
      } else if (dateRangeFilter === 'week') {
        matchesDate = ['15-02-2026', '18-02-2026', '20-02-2026'].includes(item.date);
      } else if (dateRangeFilter === 'month') {
        matchesDate = item.date.includes('-02-2026');
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
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
        } else {
          if (aValue < bValue) comparison = -1;
          else if (aValue > bValue) comparison = 1;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [donations, searchQuery, sortConfig, locationFilter, dateRangeFilter]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderPaginationButtons = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    return pages.map((page, idx) => (
      page === '...' ? (
        <span key={idx} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF]">...</span>
      ) : (
        <button 
          key={idx}
          onClick={() => setCurrentPage(page)}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
            currentPage === page ? 'bg-[#374151] text-[#FFFCFB]' : 'text-[#4B5563] hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      )
    ));
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
    const dataToExport = selectedRows.map(index => processedData[index]);
    exportToCSV(dataToExport, 'Donations_Export.csv');
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
        <ArrowUpDown size={14} className={`shrink-0 ${sortConfig.key === sortKey ? "text-[#F68E5F]" : "text-[#22333B]"}`} />
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-170px)]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-4 sm:gap-0">
        <h2 className="text-xl font-bold text-[#22333B]">Donation Enquiries</h2>
        <button 
          onClick={handleExport}
          className="px-4 py-1.5 border border-[#F68E5F] bg-[#FFFCFB] rounded-lg text-[15px] font-medium text-[#F68E5F] hover:bg-[#F68E5F] hover:text-[#FFFCFB] flex items-center gap-2 transition-colors"
        >
          Export <Download size={16} /> 
        </button>
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 text-[16px] border border-[#E5E7EB] rounded-full text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1E1E]" />
          </div>

          {/* Location Dropdown */}
          <select 
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-[#ff7535] rounded-lg text-[16px] bg-[#F68E5F] text-[#FFFCFB] focus:outline-none focus:border-[#F68E5F]"
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
            onChange={(e) => { setDateRangeFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-[#ff7535] rounded-lg text-[16px] bg-[#F68E5F] text-[#FFFCFB] focus:outline-none focus:border-[#F68E5F]"
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
        {paginatedData.length > 0 ? (
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
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-17.5 text-center">Sr.no</th>
                  {renderSortableHeader('Enquiry ID', 'id', 'left', 'w-[130px]')}
                  {renderSortableHeader('Name', 'name', 'left', 'min-w-[150px]')}
                  {renderSortableHeader('Contact', 'contact', 'left', 'w-[140px]')}
                  {renderSortableHeader('Date', 'date', 'left', 'w-[120px]')}
                  {renderSortableHeader('Time', 'time', 'left', 'w-[110px]')}
                  {renderSortableHeader('Location', 'location', 'left', 'w-[140px]')}
                  <th className="py-3 px-4 text-sm font-semibold text-[#22333B] w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  const isChecked = selectedRows.includes(globalIndex);
                  return (
                    <tr key={index} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-4 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleSelectRow(globalIndex)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#22333B] focus:ring-[#111827]" 
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] text-center">{globalIndex + 1}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.id}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.name}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.contact}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.time}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#22333B] whitespace-nowrap">{row.location}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
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
            <img src="/admin_images/donations.svg" alt="not record found" className="w-14 h-14"/>
            </div>
            <p className="text-lg font-bold text-[#22333B] mb-1">No enquiry found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4 relative mt-2 shrink-0">
        <span className="text-sm font-medium text-[#4B5563]">
          Showing {processedData.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + ITEMS_PER_PAGE, processedData.length)} of {processedData.length}
        </span>
        <div className="flex items-center gap-1 text-sm font-medium absolute left-1/2 -translate-x-1/2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-2 py-1 flex items-center gap-1 ${currentPage === 1 ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563] hover:text-[#22333B]'}`}
          >
             &larr; Previous
          </button>
          {renderPaginationButtons()}
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 flex items-center gap-1 ${currentPage === totalPages ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563] hover:text-[#22333B]'}`}
          >
             Next &rarr;
          </button>
        </div>
      </div>

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
              Do you really want to delete the enquiry from <strong>{itemToDelete.name}</strong> ({itemToDelete.id})? This process cannot be undone.
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
