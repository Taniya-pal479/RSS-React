import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronRight, FolderOpen } from "lucide-react";
import { useGetFileIndexQuery } from "../../services/rssApi";
import { useAppSelector } from "../../hook/store";

export const FileYearManager = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data, isLoading, isError, isFetching } = useGetFileIndexQuery(
    {
      groupBy: "year",
      lang: i18n.language,
    },
    {
      skip: !isAuthenticated,
    },
  );

  const files = data?.data || [];

  return (
    <div className="p-8 bg-[#fafafa] min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-12 bg-[#f97316] rounded-full" />
          <div>
            <h1 className="text-[32px] font-black text-[#1a1a1a] uppercase">
              {t("file_directory")}
            </h1>
            <p className="text-gray-400 text-sm">{t("file_directory_sub")}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-10 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
          <div className="col-span-1">#</div>
          <div className="col-span-5">{t("Year")}</div>
          <div className="col-span-4">{t("total_files")}</div>
          <div className="col-span-2 text-right">{t("actions")}</div>
        </div>

        <div className="max-h-[calc(100vh-450px)] overflow-y-auto custom-scrollbar">
          {files.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {files.map((item, index) => (
                <div
                  key={item.year}
                  onClick={() => navigate(`/year/${item.year}`)}
                  className="grid grid-cols-12 items-center px-10 py-6 hover:bg-orange-50/30 transition-all cursor-pointer group"
                >
                  <div className="col-span-1 text-gray-400 font-bold text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="col-span-5 flex items-center gap-4 font-bold text-gray-700 text-[15px] group-hover:text-orange-600">
                    <div className="p-2.5 bg-orange-50 text-orange-500 rounded-2xl">
                      <Calendar size={18} />
                    </div>
                    {item.year}
                  </div>

                  <div className="col-span-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[12px] font-bold">
                      {item.count} {t("files")}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <div className="p-2 text-gray-300 group-hover:text-orange-500 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 font-bold flex flex-col items-center">
              <FolderOpen className="opacity-20 mb-2" size={48} />
              {t("no_data_found")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileYearManager;
