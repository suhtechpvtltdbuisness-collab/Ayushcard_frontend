import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
}) => {
  const currentPage = Number(rawCurrentPage) || 1;
  const totalPages = Number(rawTotalPages) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handlePageChange = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(Number(page));
    }
  };

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
          className="w-8 h-8 flex items-center justify-center text-[#9CA3AF]"
        >
          ...
        </span>
      ) : (
        <button
          key={idx}
          onClick={() => handlePageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            currentPage === page
              ? "bg-[#F68E5F] text-[#FFFCFB] shadow-sm transform scale-105"
              : "text-[#4B5563] hover:bg-orange-50 hover:text-[#F68E5F]"
          }`}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-[#FFFFFF] shrink-0 gap-4">
      {/* Items info & Rows per page */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        <span className="text-sm font-medium text-[#6B7280] order-2 sm:order-1">
          Showing <span className="text-[#22333B]">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
          <span className="text-[#22333B]">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{" "}
          <span className="text-[#22333B] font-bold">{totalItems}</span> results
        </span>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <label htmlFor="items-per-page" className="text-sm text-[#9CA3AF] font-medium">
            Rows per page:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-sm rounded-lg focus:ring-[#F68E5F] focus:border-[#F68E5F] block px-2.5 py-1.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
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
          <span className="hidden lg:inline text-sm font-semibold pr-1">Previous</span>
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
          <span className="hidden lg:inline text-sm font-semibold pl-1">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
