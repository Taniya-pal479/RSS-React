import { useRef, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronRight, FolderOpen } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGetAllFilesQuery } from "../../services/rssApi";
import { useAppSelector } from "../../hook/store";

export const FileYearManager = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Pagination state for infinite scroll
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const { data, isLoading, isFetching } = useGetAllFilesQuery(
    {
      lang: i18n.language,
      skip: page * rowsPerPage,
      take: rowsPerPage,
    },
    { skip: !isAuthenticated },
  );

  // Accessing the merged files and total from your query result
  const files = useMemo(() => {
    return data?.data || [];
  }, [data]);
  const totalCountServer = data?.total ?? 0;

  console.log("files in years ", files);

  // Grouping the merged files into years
  const yearData = useMemo(() => {
    const stats: Record<string, number> = {};
    files.forEach((file) => {
      if (file.year) {
        const year = String(file.year);
        stats[year] = (stats[year] || 0) + 1;
      }
    });

    return Object.entries(stats)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [files]);

  console.log("yearData", yearData);

  const rowVirtualizer = useVirtualizer({
    count: yearData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  console.log("virtualItem", virtualItems);

  // Infinite Scroll Trigger logic
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    // If we are near the end of what we've loaded, and there is more on server
    if (
      lastItem.index >= yearData.length - 1 &&
      files.length < totalCountServer &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  }, [
    virtualItems,
    isFetching,
    yearData.length,
    files.length,
    totalCountServer,
  ]);

  if (isLoading && page === 0) {
    return (
      <div className="flex h-screen justify-center items-center bg-[#fdfcfb]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-[#fdfcfb] h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-end mb-5 flex-none">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">
            {t("archive_by_year")}
          </h2>
          <p className="text-gray-400 text-sm">{t("content_type_subtitle")}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden min-h-0">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest flex-none">
          <div className="col-span-1">#</div>
          <div className="col-span-5">{t("Year")}</div>
          <div className="col-span-4">{t("total_files")}</div>
          <div className="col-span-2 text-right">{t("actions")}</div>
        </div>

        {/* Scrollable Viewport */}
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
          style={{
            minHeight: 0,
            scrollbarGutter: "stable",
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const item = yearData[virtualRow.index];
              if (!item) return null;

              return (
                <div
                  key={item.year}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-12 items-center px-6 border-b border-gray-50 hover:bg-orange-50/30 transition-colors"
                >
                  <div className="col-span-1 text-gray-400 text-sm">
                    #{virtualRow.index + 1}
                  </div>

                  <div
                    className="col-span-5 flex items-center gap-3 font-bold text-[#1a1a1a] text-[15px] cursor-pointer hover:text-orange-600"
                    onClick={() => navigate(`/year/${item.year}`)}
                  >
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                      <Calendar size={16} />
                    </div>
                    {item.year}
                  </div>

                  <div className="col-span-4 text-gray-500 font-medium">
                    {item.count} {t("files")}
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => navigate(`/year/${item.year}`)}
                      className="p-2 bg-gray-50 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {isFetching && (
            <div className="sticky bottom-0 bg-white/90 py-2 text-center text-orange-500 text-xs font-bold animate-pulse">
              {t("loading")}...
            </div>
          )}

          {yearData.length === 0 && !isFetching && (
            <div className="p-20 text-center text-gray-400 font-bold flex flex-col items-center">
              <FolderOpen className="opacity-20 mb-2" size={48} />
              {t("no_data_available")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileYearManager;
