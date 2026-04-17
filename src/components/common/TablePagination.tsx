import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  options?: number[];
}

const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  options = [10, 20, 50, 100],
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 rounded-b-2xl">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Rows per page</span>
        <div className="relative">
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full pl-3 pr-8 py-1.5 cursor-pointer outline-none transition-all"
          >
            {options.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-gray-700">
          Page <span className="text-orange-600">{currentPage}</span> of{" "}
          {totalPages || 1}
        </span>

        <div className="flex items-center gap-1">
          <PaginationButton
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            icon={<ChevronsLeft size={18} />}
          />
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            icon={<ChevronLeft size={18} />}
          />
          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            icon={<ChevronRight size={18} />}
          />
          <PaginationButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            icon={<ChevronsRight size={18} />}
          />
        </div>
      </div>
    </div>
  );
};

const PaginationButton = ({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all cursor-pointer"
  >
    {icon}
  </button>
);

export default TablePagination;
