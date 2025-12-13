import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 px-2">
      <div className="text-sm text-gray-400 font-medium">
        Page <span className="text-white">{currentPage}</span> of{' '}
        <span className="text-white">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:border-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1a] disabled:hover:border-[#262626] transition-all font-medium text-sm"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="hidden md:flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg glow-green'
                    : 'bg-[#1a1a1a] border border-[#262626] hover:bg-[#1f1f1f] hover:border-green-500/30 text-gray-300'
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:border-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1a] disabled:hover:border-[#262626] transition-all font-medium text-sm"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
