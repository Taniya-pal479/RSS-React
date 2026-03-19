import { useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronRight, FolderOpen } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGetAllFilesQuery } from "../../services/rssApi";
import { useAppSelector } from "../../hook/store";

export const FileYearManager = () => {
  const { t, i18n } = useTranslation();
  const { categoryId, contentTypeId } = useParams();
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: files = [], isLoading } = useGetAllFilesQuery(i18n.language, {
    skip: !isAuthenticated,
  });

  console.log("yearWise file", files);

  console.log("catID", categoryId);
  console.log("conID", contentTypeId);

  const yearData = useMemo(() => {
    const stats: Record<string, number> = {};

    files.forEach((file) => {
      if (file.year) {
        const year = file.year;
        stats[year] = (stats[year] || 0) + 1;
      }
    });

    return Object.entries(stats)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [files]);

  const rowVirtualizer = useVirtualizer({
    count: yearData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74,
    overscan: 10,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-[#fdfcfb] min-h-[50vh]">
      <div className="flex justify-between items-end mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">
            {t("archive_by_year")}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
          <div className="col-span-1">#</div>
          <div className="col-span-5">{t("Year")}</div>
          <div className="col-span-4">{t("total_files")}</div>
          <div className="col-span-2 text-right">{t("actions")}</div>
        </div>

        <div
          ref={parentRef}
          className="overflow-y-auto custom-scrollbar h-[500px]"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = yearData[virtualRow.index];

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
                    {virtualRow.index + 1}
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
                      className="p-2 bg-gray-50 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}

            {yearData.length === 0 && (
              <div className="p-20 text-center text-gray-400 font-bold">
                <FolderOpen className="mx-auto mb-2 opacity-20" size={48} />
                {t("no_data_available")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileYearManager;
