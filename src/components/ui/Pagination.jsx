import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

/**
 * Common Pagination component for all admin tables
 * Includes items per page dropdown and responsive controls
 */
const Pagination = ({
  currentPage: rawCurrentPage,
  totalPages: rawTotalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  pageSizeOptions = [25, 50, 100],
}) => {
  const totalPages = Math.max(1, Number(rawTotalPages) || 1);
  let currentPage = Number(rawCurrentPage) || 1;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handlePageChange = (page) => {
    if (page === "..." || page === currentPage) return;
    const n = Number(page);
    if (!Number.isFinite(n) || n < 1 || n > totalPages) return;
    onPageChange(n);
  };

  /** Sliding window + ellipses — avoids duplicate / invalid sequences for any totalPages */
  const buildPageList = (tp, cp) => {
    if (tp <= 1) return [1];
    const delta = 2;
    const set = new Set();
    for (let i = 1; i <= tp; i++) {
      if (i === 1 || i === tp || (i >= cp - delta && i <= cp + delta)) {
        set.add(i);
      }
    }
    const sorted = [...set].sort((a, b) => a - b);
    const out = [];
    let prev;
    for (const i of sorted) {
      if (prev != null) {
        if (i - prev === 2) out.push(prev + 1);
        else if (i - prev > 2) out.push("...");
      }
      out.push(i);
      prev = i;
    }
    return out;
  };

  const renderPaginationButtons = () => {
    const pages = buildPageList(totalPages, currentPage);
    return pages.map((page, idx) =>
      page === "..." ? (
        <span
          key={`ellipsis-${idx}`}
          className="w-8 h-8 flex items-center justify-center text-[#9CA3AF]"
        >
          ...
        </span>
      ) : (
        <button
          key={page}
          type="button"
          onClick={() => handlePageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            currentPage === page
              ? "bg-[#F68E5F] text-[#FFFCFB] shadow-sm transform scale-105"
              : "text-[#4B5563] hover:bg-orange-50 hover:text-[#F68E5F]"
          }`}
        >
          {page}
        </button>
      ),
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 bg-[#FFFFFF] shrink-0 gap-3 md:gap-4">
      {/* Mobile-only Layout */}
      <div className="flex flex-col w-full gap-3 md:hidden">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <label htmlFor="items-per-page-mob" className="text-xs text-[#9CA3AF] font-medium">
              Rows:
            </label>
            <CustomSelect
              value={itemsPerPage}
              onChange={onItemsPerPageChange}
              options={pageSizeOptions}
              mobile={true}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`p-1 flex items-center justify-center rounded-md ${
                currentPage <= 1 ? "text-gray-300" : "text-[#4B5563] bg-gray-50 active:bg-gray-200"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-semibold text-[#4B5563]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`p-1 flex items-center justify-center rounded-md ${
                currentPage >= totalPages ? "text-gray-300" : "text-[#4B5563] bg-gray-50 active:bg-gray-200"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-center w-full">
          <span className="text-xs font-medium text-[#6B7280]">
            Showing <span className="text-[#22333B]">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
            <span className="text-[#22333B]">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{" "}
            <span className="text-[#22333B] font-bold">{totalItems}</span> results
          </span>
        </div>
      </div>

      {/* Desktop-only Layout */}
      <div className="hidden md:flex items-center gap-6 w-auto">
        <span className="text-sm font-medium text-[#6B7280]">
          Showing <span className="text-[#22333B]">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
          <span className="text-[#22333B]">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{" "}
          <span className="text-[#22333B] font-bold">{totalItems}</span> results
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm text-[#9CA3AF] font-medium">
            Rows per page:
          </label>
          <CustomSelect
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            options={pageSizeOptions}
          />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end gap-1 w-auto">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`px-3 py-1.5 flex items-center gap-1 rounded-lg transition-all ${
            currentPage <= 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-[#4B5563] hover:bg-gray-100 hover:text-[#F68E5F]"
          }`}
          title="Previous Page"
        >
          <ChevronLeft size={20} />
          <span className="hidden xl:inline text-sm font-semibold pr-1">Previous</span>
        </button>

        <div className="flex items-center gap-1 mx-2">
          {renderPaginationButtons()}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-3 py-1.5 flex items-center gap-1 rounded-lg transition-all ${
            currentPage >= totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-[#4B5563] hover:bg-gray-100 hover:text-[#F68E5F]"
          }`}
          title="Next Page"
        >
          <span className="hidden xl:inline text-sm font-semibold pl-1">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const CustomSelect = ({ value, onChange, options, mobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] font-medium rounded-md focus:ring-1 focus:ring-[#F68E5F] focus:border-[#F68E5F] outline-none cursor-pointer flex items-center justify-between gap-1 hover:bg-gray-50 transition-colors ${
          mobile ? "text-xs px-1.5 py-1 min-w-[50px]" : "text-sm px-2.5 py-1.5 min-w-[60px]"
        }`}
      >
        <span>{value}</span>
        <ChevronDown size={mobile ? 12 : 14} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute bottom-full mb-1 left-0 min-w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(Number(opt));
                  setIsOpen(false);
                }}
                className={`px-3 py-1.5 text-xs md:text-sm cursor-pointer hover:bg-orange-50 transition-colors ${
                  value === opt ? "bg-orange-50 text-[#F68E5F] font-bold" : "text-gray-700 font-medium"
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Pagination;
