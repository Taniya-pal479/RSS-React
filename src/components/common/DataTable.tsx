import React from "react";
import { useTranslation } from "react-i18next";

export interface Column<T> {
  header: string;
  key: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

const DataTable = <T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyMessage,
  onRowClick,
}: DataTableProps<T>) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-y-auto max-h-[600px] relative">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#f9fafb]/50 border-b border-gray-50">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`${col.className} px-10 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-20 text-center text-gray-400"
              >
                {t("loading")}...
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-[#f9fafb]"
              >
                {columns.map((col, idx) => {
                  // Logic changed to target the first column (idx === 0)
                  const isFirstColumn = idx === 1;

                  return (
                    <td
                      key={idx}
                      className={`px-10 py-6 ${col.className} ${
                        isFirstColumn && onRowClick ? "cursor-pointer group-hover:text-orange-600 transition-colors" : ""
                      }`}
                      onClick={() => {
                        if (isFirstColumn) onRowClick?.(item);
                      }}
                    >
                      {/* The text color changes to orange when the row is hovered 
                         thanks to the 'group-hover' class on the first column 
                      */}
                      <div className={`${isFirstColumn ? "group-hover:text-orange-600 transition-colors" : ""}`}>
                        {col.render ? col.render(item, index) : (item as any)[col.key]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-20 text-center text-gray-400 italic"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;