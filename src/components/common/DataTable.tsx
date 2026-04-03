import { useTranslation } from "react-i18next";

export interface Column<T> {
  header: string;
  key: keyof T;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T extends { id: string | number; tableId?: string }> {
  columns: Column<T>[];
  data: T[];

  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  /**
   * Optional callback fired when the user scrolls to the bottom of the
   * table container. Useful for infinite-loading scenarios.
   */
  onLoadMore?: () => void;
}

const DataTable = <T extends { id: string | number; tableId?: string }>({
  columns,
  data,
  isLoading,
  emptyMessage,
  onRowClick,
  onLoadMore,
}: DataTableProps<T>) => {
  const { t } = useTranslation();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || isLoading) {
      return;
    }
    const target = e.currentTarget;
    // when we've scrolled within 20px of the bottom, fire the callback
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
      onLoadMore();
    }
  };

  return (
    <div
      onScroll={handleScroll}
      className="bg-white rounded-4xl  border border-gray-100  rounded-bl-sm rounded-br-sm shadow-sm overflow-y-auto    custom-scrollbar  max-h-135 relative  "
    >
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-white">
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
                key={`${item.tableId || item.id}-${index}`}
                className="group transition-colors hover:bg-[#f9fafb]"
              >
                {columns.map((col, idx) => {
                  const isFirstColumn = idx === 1;

                  return (
                    <td
                      key={idx}
                      className={`px-10 py-6 ${col.className} ${
                        isFirstColumn && onRowClick
                          ? "cursor-pointer group-hover:text-orange-600 transition-colors"
                          : ""
                      }`}
                      onClick={() => {
                        if (isFirstColumn) onRowClick?.(item);
                      }}
                    >
                      <div
                        className={`${isFirstColumn ? "group-hover:text-orange-600 transition-colors" : ""}`}
                      >
                        {col.render
                          ? col.render(item, index)
                          : (item[col.key] as React.ReactNode)}
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
