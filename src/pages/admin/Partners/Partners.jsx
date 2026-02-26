import React, { useState, useMemo } from 'react';
import { Search, Plus, Eye, Trash2, Download, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const getPartners = () => {
  const stored = localStorage.getItem('partners_data');
  if (stored) return JSON.parse(stored);
  
  const initialData = Array.from({ length: 14 }).map((_, i) => {
    const types = ['Hospital', 'Pathology Lab', 'Clinic', 'Nursing Home'];
    const statuses = ['Not verified', 'Verified', 'Inactive'];
    return {
      id: `P-${1001456 + i}`,
      type: types[i % types.length],
      orgName: 'Care Hospital',
      primaryContact: '8373849574',
      location: 'Kanpur,UP',
      status: statuses[i % statuses.length],
      rating: (4.0 + (i % 10) / 10).toFixed(1),
      members: 850 + i * 10,
      details: {
        registrationNumber: `HOSP/2020/00${(i % 9) + 1}`,
        partnerId: `PTE-00${(i % 9) + 1}`,
        establishmentYear: '2005-01-01',
        bedCapacity: 1200 + i * 10,
        staffCount: 420 + i * 5,
        ambulanceService: '5 Ambulances Available',
        emergencyServices: 'available 24/7'
      },
      specializations: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Gynecology'],
      doctors: [
        { id: 1, name: 'Dr. Sarah Wilson', specialty: 'CARDIOLOGIST', days: ['Mon', 'Wed', 'Fri'], timeFrom: '09:00 AM', timeTo: '01:00 PM', image: 'female' },
        { id: 2, name: 'Dr. James Miller', specialty: 'NEUROLOGIST', days: ['Tue', 'Thu', 'Sat'], timeFrom: '10:00 AM', timeTo: '04:00 PM', image: 'male' },
        { id: 3, name: 'Dr. Elena Petrova', specialty: 'PEDIATRICIAN', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timeFrom: '08:00 AM', timeTo: '12:00 PM', image: 'female' },
      ]
    };
  });
  localStorage.setItem('partners_data', JSON.stringify(initialData));
  return initialData;
};

const StatusBadge = ({ status }) => {
  let bg = '';
  let dot = '';
  let text = '';

  switch (status) {
    case 'Not verified':
      bg = 'bg-[#FFA10033]';
      dot = 'bg-[#FFA100]';
      text = 'text-[#FFA100]';
      break;
    case 'Verified':
      bg = 'bg-[#76DB1E33]';
      dot = 'bg-[#76DB1E]';
      text = 'text-[#76DB1E]';
      break;
    case 'Inactive':
      bg = 'bg-[#FF383C33]';
      dot = 'bg-[#FF383C]';
      text = 'text-[#FF383C]';
      break;
    default:
      bg = 'bg-gray-100';
      dot = 'bg-gray-400';
      text = 'text-gray-600';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-normal ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};

const ActionButtons = ({ item, navigate, onDelete }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-[84px] flex justify-center">
        <button 
          onClick={() => navigate(`/admin/partners/${item.id}`, { state: { editMode: true } })}
          className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[#2C2C2C] text-white rounded-lg text-sm font-normal hover:bg-[#1F2937]"
        >
          Edit 
          <img src="/admin_images/Edit 3.svg" alt="edit" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(`/admin/partners/${item.id}`)}
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
  const [partners, setPartners] = useState(getPartners());
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const ITEMS_PER_PAGE = 10;

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const updatedData = partners.filter(p => p.id !== itemToDelete.id);
      setPartners(updatedData);
      localStorage.setItem('partners_data', JSON.stringify(updatedData));
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
    let result = [...partners].filter(item => {
      const matchesSearch = item.orgName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.primaryContact.includes(searchQuery);
      
      if (activeFilter === 'All') return matchesSearch;
      if (activeFilter === 'Not Verified') return matchesSearch && item.status === 'Not verified';
      return matchesSearch && item.status.toLowerCase() === activeFilter.toLowerCase();
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
  }, [partners, searchQuery, activeFilter, sortConfig]);

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
            currentPage === page ? 'bg-[#374151] text-white' : 'text-[#4B5563] hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      )
    ));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedData.map((_, idx) => startIndex + idx));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (globalIndex) => {
    setSelectedRows(prev => 
      prev.includes(globalIndex) 
        ? prev.filter(i => i !== globalIndex) 
        : [...prev, globalIndex]
    );
  };

  const renderSortableHeader = (title, sortKey, align = 'left', className = '') => (
    <th className={`py-3 px-4 text-sm font-semibold text-[#1B2128] whitespace-nowrap ${className}`}>
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
        <h2 className="text-xl font-bold text-[#22333B]">Partners</h2>
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 border border-[#767676] bg-[#E3E3E3] rounded-lg text-[15px] font-medium text-[#374151] hover:bg-[#D1D5DB] flex items-center gap-2 transition-colors">
            Export <Download size={16} /> 
          </button>
          {/* Create Button (Tablet/Mobile Only) */}
          <button 
            onClick={() => navigate('/admin/partners/create')}
            className="flex lg:hidden px-4 py-1.5 bg-[#F68E5F] text-white rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors items-center gap-2"
          >
            Add New Partner <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          {/* Search */}
          <div className="relative w-[280px]">
            <input 
              type="text" 
              placeholder="Search by name, id, phone" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 text-[16px] border border-[#E5E7EB] rounded-full text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F]"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1E1E]" />
          </div>

          {/* Status Tabs */}
          <div className="flex p-1 bg-[#F7F7F7] rounded-xl shrink-0" style={{ fontFamily: 'ABeeZee, sans-serif' }}>
            {['All', 'Verified', 'Not Verified', 'Inactive'].map(filter => (
              <button
                key={filter}
                onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
                className={`px-4 py-1.5 text-[15px] rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter 
                    ? 'bg-white text-[#111827] shadow-sm' 
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Create Button (Desktop only) */}
        <button 
          onClick={() => navigate('/admin/partners/create')}
          className="hidden lg:flex px-5 py-2.5 bg-[#F68E5F] text-white rounded-lg text-[16px] font-medium hover:bg-[#ff6e2b] transition-colors items-center gap-2"
        >
          Add New Partner <Plus size={16} />
        </button>
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
                      checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length && selectedRows.every(idx => paginatedData.some((_, i) => startIndex + i === idx))}
                      className="w-4 h-4 rounded border-[#D1D5DB] border text-[#111827] focus:ring-[#111827]" 
                    />
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-[#1B2128] w-[70px]">Sr.no</th>
                  {renderSortableHeader('Partner ID', 'id', 'left', 'w-[130px]')}
                  {renderSortableHeader('Type', 'type', 'left', 'w-[160px]')}
                  {renderSortableHeader('Org Name', 'orgName', 'left', 'min-w-[180px]')}
                  {renderSortableHeader('Primary Contact', 'primaryContact', 'left', 'w-[150px]')}
                  {renderSortableHeader('Location', 'location', 'left', 'w-[150px]')}
                  {renderSortableHeader('Status', 'status', 'left', 'w-[140px]')}
                  <th className="py-3 px-4 text-sm font-semibold text-[#1B2128] w-[130px]">Actions</th>
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
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]" 
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#1B2128]">{globalIndex + 1}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.id}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.type}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.orgName}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.primaryContact}</td>
                      <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.location}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={row.status} />
                      </td>
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
            <img src="/admin_images/partner.svg" alt="not record found" className="w-20 h-20"/>
            </div>
            <p className="text-lg font-bold text-[#111827] mb-1">No such partner found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center px-2 py-4 relative mt-2 shrink-0">
        <span className="absolute left-0 text-sm font-medium text-[#4B5563]">
          Showing {processedData.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + ITEMS_PER_PAGE, processedData.length)} of {processedData.length}
        </span>
        <div className="flex items-center gap-1 text-sm font-medium">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-2 py-1 flex items-center gap-1 ${currentPage === 1 ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563] hover:text-[#111827]'}`}
          >
             &larr; Previous
          </button>
          {renderPaginationButtons()}
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 flex items-center gap-1 ${currentPage === totalPages ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563] hover:text-[#111827]'}`}
          >
             Next &rarr;
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">Are you sure?</h3>
            </div>
            <p className="text-[#4B5563] text-sm mb-6 pl-12 line-clamp-3">
              Do you really want to delete the partner <strong>{itemToDelete.orgName}</strong> ({itemToDelete.id})? This process cannot be undone.
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
                className="px-4 py-2 bg-[#F68E5F] text-white rounded-lg text-sm font-medium hover:bg-[#ff702d] transition-colors shadow-sm"
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
