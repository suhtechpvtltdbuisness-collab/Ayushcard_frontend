import React, { useState, useMemo } from 'react';
import { Search, Plus, MoreHorizontal, Edit2, RefreshCw, Eye, Trash2, Download, Folder, PlusCircle, ArrowUpDown } from 'lucide-react';

const userNames = ['Neeraj', 'Yuvraj', 'Gautam', 'Soumya Sindhu', 'Akriti Nanda', 'Samiksha Umbarje', 'Neeraj K', 'Gautam Kumar', 'Yuvraj Singh', 'Saurabh', 'Sindhu Soumya'];

export const getHealthCards = () => {
  const stored = localStorage.getItem('health_cards_data');
  if (stored) return JSON.parse(stored);
  
  const initialData = Array.from({ length: 16 }).map((_, i) => {
    const mockName = userNames[i % userNames.length];
    return {
      id: `ASS-200${i + 1}`,
      applicant: mockName,
      phone: `987654321${i % 10}`,
      address: "123, Sector 4, MG Road, Bangalore",
      dateApplied: "10/12/2023",
      verificationDate: "10/15/2023",
      expiryDate: "10/15/2024",
      status: i % 3 === 0 ? 'Not verified' : i % 3 === 1 ? 'Verified' : 'Expired',
      members: [
        { id: 1, name: mockName, relation: "Self", age: 42 },
        { id: 2, name: "Suman Devi", relation: "Spouse", age: 38 },
        { id: 3, name: "Aryan Kumar", relation: "Son", age: 14 },
        { id: 4, name: "Ishita Kumar", relation: "Daughter", age: 11 },
        { id: 5, name: "Om Prakash", relation: "Father", age: 70 },
      ].slice(0, (i % 5) + 1),
      payment: {
        applicationFee: 120.00,
        memberAddOns: (i % 5 + 1) * 10,
        totalPaid: 120.00 + (i % 5 + 1) * 10
      }
    };
  });
  localStorage.setItem('health_cards_data', JSON.stringify(initialData));
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
    case 'Expired':
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

import { useNavigate } from 'react-router-dom';

const ActionButtons = ({ status, item, navigate, onDelete }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-[84px] flex justify-center">
        {status === 'Not verified' && (
          <span className="w-full text-center text-[#111827] font-bold">—</span>
        )}
        {status === 'Verified' && (
          <button 
            onClick={() => navigate(`/admin/health-card/${item.id}`, { state: { editMode: true } })}
            className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[#2C2C2C] text-white rounded-lg text-sm font-normal hover:bg-[#1F2937]"
          >
            Edit 
            <img src="/admin_images/Edit 3.svg" alt="edit" />
          </button>
        )}
        {status === 'Expired' && (
          <button 
            onClick={() => navigate(`/admin/health-card/${item.id}`, { state: { editMode: true } })}
            className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[#2C2C2C] text-white rounded-lg text-sm font-normal hover:bg-[#1F2937]"
          >
            Renew 
            <img src="/admin_images/Edit 3.svg" alt="edit" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(`/admin/health-card/${item.id}`)}
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

const HealthCard = () => {
  const navigate = useNavigate();
  const [healthCards, setHealthCards] = useState(getHealthCards());
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemToDelete, setItemToDelete] = useState(null);
  const ITEMS_PER_PAGE = 10;

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const updatedData = healthCards.filter(c => c.id !== itemToDelete.id);
      setHealthCards(updatedData);
      localStorage.setItem('health_cards_data', JSON.stringify(updatedData));
      if (selectedRows.some(rowIdx => processedData[rowIdx]?.id === itemToDelete.id)) {
          setSelectedRows([]);
      }
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
    let result = [...healthCards].filter(item => {
      const matchesSearch = item.applicant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.phone.includes(searchQuery);
      
      if (activeFilter === 'All') return matchesSearch;
      return matchesSearch && item.status.toLowerCase() === activeFilter.toLowerCase();
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'members') {
          aValue = a.members.length;
          bValue = b.members.length;
        } else if (sortConfig.key === 'amount') {
          aValue = a.payment.totalPaid;
          bValue = b.payment.totalPaid;
        }

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
  }, [healthCards, searchQuery, activeFilter, sortConfig]);

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
          className={`w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium ${
            currentPage === page ? 'bg-[#374151] text-white' : 'text-[#4B5563] hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      )
    ));
  };

  const isFiltered = searchQuery !== '' || activeFilter !== 'All';

  const [selectedRows, setSelectedRows] = useState([]);

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
        <h2 className="text-xl font-bold text-[#22333B]">Health Card Applications</h2>
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 border border-[#767676] bg-[#E3E3E3] rounded-lg text-[15px] font-medium text-[#374151] hover:bg-[#D1D5DB] flex items-center gap-2">
            Export <Download size={16} /> 
          </button>
          {/* Create Button (Tablet/Mobile Only) */}
          <button 
            onClick={() => navigate('/admin/health-card/create')}
            className="flex lg:hidden px-4 py-1.5 bg-[#F68E5F] text-white rounded-lg text-[15px] font-medium hover:bg-[#ff7535] transition-colors items-center gap-2"
          >
            Create New 
            <span className="hidden sm:inline">application</span> 
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4 flex-1">
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
          <div className="flex p-1 bg-[#F7F7F7] rounded-xl shrink-0"style={{ fontFamily: 'ABeeZee, sans-serif' }}>
            {['All', 'Verified', 'Not Verified', 'Expired'].map(filter => (
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
          onClick={() => navigate('/admin/health-card/create')}
          className="hidden lg:flex px-5 py-2.5 bg-[#F68E5F] text-white rounded-lg text-[16px] font-medium hover:bg-[#ff6e2b] transition-colors items-center gap-2"
        >
          Create New application <Plus size={16} />
        </button>
      </div>

      {/* Table & Fallbacks */}
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
                  {renderSortableHeader('Card ID', 'id', 'left', 'w-[130px]')}
                  {renderSortableHeader('Applicant', 'applicant', 'left', 'min-w-[180px]')}
                  {renderSortableHeader('Phone', 'phone', 'left', 'w-[140px]')}
                  {renderSortableHeader('Members', 'members', 'center', 'w-[120px]')}
                  {renderSortableHeader('Amount', 'amount', 'right', 'w-[120px]')}
                  {renderSortableHeader('Status', 'status', 'left', 'w-[140px]')}
                  <th className="py-3 px-4 text-sm font-semibold text-[#1B2128] w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <tr key={index} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedRows.includes(globalIndex)}
                          onChange={() => handleSelectRow(globalIndex)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]" 
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-normal text-[#1B2128]">{globalIndex + 1}</td>
                    <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.id}</td>
                    <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.applicant}</td>
                    <td className="py-3 px-4 text-sm font-normal text-[#1B2128] whitespace-nowrap">{row.phone}</td>
                    <td className="py-3 px-4 text-sm font-normal text-[#1B2128] text-center">{row.members?.length || 0}</td>
                    <td className="py-3 px-4 text-sm font-normal text-[#1B2128] text-right whitespace-nowrap">₹{(row.payment?.totalPaid || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-4">
                      <ActionButtons status={row.status} item={row} navigate={navigate} onDelete={setItemToDelete} />
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 bg-white">
            <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-6">
             <img src="/admin_images/folder.svg" alt="no card found" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">No Card Applications Found</h3>
            {!isFiltered && (
              <button 
                onClick={() => navigate('/admin/health-card/create')}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#F68E5F] hover:bg-[#ff7535] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <PlusCircle size={18} />
                Create New Application
              </button>
            )}
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
              Do you really want to delete the health card application for <strong>{itemToDelete.applicant}</strong> ({itemToDelete.id})? 
              This process cannot be undone.
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

export default HealthCard;
