import { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowLeft,
  Home,
  ChevronRight,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import {
  useDeleteFileMutation,
  useGetAllFilesQuery,
} from "../../services/rssApi";
import { useDownload } from "../../hook/useDownload";
import { toast } from "react-toastify";
import ConfirmToast from "../../components/ui/ConfirmToast";

const FileYearDetails = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { handleDownload } = useDownload();

  const parentRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const {
    data: filesData,
    isLoading,
    isFetching,
  } = useGetAllFilesQuery({
    lang: i18n.language,
    skip: page * rowsPerPage,
    take: rowsPerPage,
  });

  // Since we are filtering locally, we use the merged files from the cache
  const allFiles = useMemo(() => {
    return filesData?.data || [];
  }, [filesData]);
  const totalCountServer = filesData?.total ?? 0;

  // Filter items by year
  const yearFiles = useMemo(() => {
    return allFiles.filter((f) => String(f.year) === String(year));
  }, [allFiles, year]);
  console.log("fileData", filesData);
  console.log("yearFiles", allFiles);

  // --- Virtualizer Setup ---
  const rowVirtualizer = useVirtualizer({
    count: yearFiles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // --- Infinite Scroll Trigger ---
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    // Trigger next page if we reach the end of the current local array
    // AND there's more data to fetch from the server
    if (
      lastItem.index >= yearFiles.length - 1 &&
      allFiles.length < totalCountServer &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  }, [
    virtualItems,
    isFetching,
    yearFiles.length,
    allFiles.length,
    totalCountServer,
  ]);

  const [deleteFile] = useDeleteFileMutation();

  const handleDeleteClick = (id: number) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          message={t("confirm_delete_msg")}
          onConfirm={() => executeDelete(id)}
          closeToast={closeToast}
        />
      ),

      {
        position: "top-center",

        autoClose: false,

        closeOnClick: false,

        draggable: false,

        className: "rounded-2xl shadow-2xl border border-gray-100",
      },
    );
  };

  const executeDelete = async (id: number) => {
    try {
      await deleteFile(id).unwrap();

      toast.success(t("DELETED_SUCCESSFULLY"));
    } catch (err) {
      console.log(err);

      toast.error(t("ERROR_DELETING"));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] p-8 overflow-hidden">
      {/* Breadcrumbs */}
      <div className="flex-none">
        <nav className="flex items-center gap-2 mb-8 text-sm font-bold text-slate-400">
          <Home
            size={16}
            className="cursor-pointer hover:text-orange-500"
            onClick={() => navigate("/")}
          />
          <ChevronRight size={14} />
          <span
            className="cursor-pointer hover:text-orange-500"
            onClick={() => navigate(-1)}
          >
            {t("all_files")}
          </span>
          <ChevronRight size={14} />
          <span className="text-orange-600 uppercase tracking-widest">
            {year}
          </span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {year} <span className="text-orange-500">{t("collection")}</span>
        </h1>
      </div>

      {/* Virtualized Table Container */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
          <div className="col-span-6">{t("file_display_name")}</div>
          <div className="col-span-3">{t("size")}</div>
          <div className="col-span-3 text-right">{t("actions")}</div>
        </div>

        {/* Scrollable Viewport */}
        <div
          ref={parentRef}
          className="h-350px  min-h-[350px] overflow-y-auto custom-scrollbar"
        >
          {isLoading && yearFiles.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              {t("loading")}...
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualItems.map((virtualRow) => {
                const file = yearFiles[virtualRow.index];
                if (!file) return null;

                return (
                  <div
                    key={file.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="grid grid-cols-12 items-center px-8 border-b border-slate-50 hover:bg-orange-50/30 transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-4 py-2">
                      <div className="p-3 bg-orange-50 text-blue-600 rounded-2xl shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span
                          onClick={() =>
                            window.open(
                              file.url ||
                                `http://localhost:3000/uploads/${file.storageKey}`,
                              "_blank",
                            )
                          }
                          className="font-bold text-slate-800"
                        >
                          {file.displayName}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                          {file.mimeType}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3 text-slate-500 font-bold">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </div>

                    <div className="col-span-3 flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleDownload(file.url, file.displayName)
                        }
                        className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all cursor-pointer"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(file.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading Indicator at Bottom */}
          {isFetching && yearFiles.length > 0 && (
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-2 text-center text-orange-500 font-bold text-xs uppercase animate-pulse">
              {t("loading")}...
            </div>
          )}
        </div>

        {yearFiles.length === 0 && !isLoading && (
          <div className="py-20 text-center text-gray-400 italic">
            {t("no_files_found")}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileYearDetails;
