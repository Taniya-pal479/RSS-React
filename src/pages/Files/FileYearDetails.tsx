import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Home,
  ChevronRight,
  FileText,
  HardDrive,
  Download,
  Trash2,
} from "lucide-react";
import DataTable, { type Column } from "../../components/common/DataTable";
import { useGetAllFilesQuery } from "../../services/rssApi";
import { useDownload } from "../../hook/useDownload";
import type { FileObject } from "../../types";

const FileYearDetails = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { handleDownload } = useDownload();

  const { data: files = [], isLoading } = useGetAllFilesQuery(i18n.language);

  const yearFiles = useMemo(() => {
    return (files ?? []).filter((f) => String(f.year) === String(year));
  }, [files, year]);

  console.log("yearwiseFile .....", files);

  const columns: Column<FileObject>[] = [
    {
      header: t("file_display_name"),
      key: "fileName",
      className: "w-[40%]",
      render: (file) => (
        <div className="flex items-center gap-4 py-2">
          <div className="p-3 bg-orange-50 text-blue-600 rounded-2xl shadow-sm">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{file.displayName}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {file.mimeType}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("size"),
      key: "fileSize",
      className: "w-[15%]",
      render: (file) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <HardDrive size={14} className="text-slate-300" />
          {(file.fileSize / 1024).toFixed(1)} KB
        </div>
      ),
    },
    {
      header: t("actions"),
      key: "actions" as keyof FileObject,
      className: "w-[25%] text-right",
      render: (file) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleDownload(file.url, file.displayName)}
            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all cursor-pointer"
          >
            <Download size={18} />
          </button>
          <button className="p-2 bg-red-50 text-red-500 rounded-xl cursor-pointer">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen">
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

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-orange-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {year} <span className="text-orange-500">{t("collection")}</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={yearFiles}
          isLoading={isLoading}
          emptyMessage={`${t("no_files_found_for")} ${year}`}
        />
      </div>
    </div>
  );
};

export default FileYearDetails;
