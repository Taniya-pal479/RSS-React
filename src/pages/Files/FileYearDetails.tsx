import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  FileText,
  Download,
  Trash2,
  HardDrive,
  Home,
  ChevronRight,
  Edit2,
} from "lucide-react";

import DataTable, { type Column } from "../../components/common/DataTable";

import {
  useGetAllFilesQuery,
  useGetContentTypesQuery,
  useDeleteFileMutation,
} from "../../services/rssApi";

import { toast } from "react-toastify";
import ConfirmToast from "../../components/ui/ConfirmToast";
import EditFileModal from "../../components/common/EditFileModal";
import type { FileObject } from "../../types";
import { useDownload } from "../../hook/useDownload";
import { useAppSelector } from "../../hook/store";
import ContentTypeFilter from "../../components/ui/ContentTypeFilter";

const FileYearDetails = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [fileEdit, setFileedit] = useState<FileObject | null>(null);
  const { handleDownload } = useDownload();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: filesData, isLoading } = useGetAllFilesQuery(
    {
      lang: i18n.language,
      skip: 0,
      take: 1000,
    },
    {
      skip: !isAuthenticated,
    },
  );

  const allFiles = filesData?.data || [];

  const yearFiles = useMemo(() => {
    let filtered = allFiles.filter((f) => String(f.year) === String(year));

    if (selectedType) {
      filtered = filtered.filter(
        (f) => String(f.contentTypeId) === String(selectedType),
      );
    }

    return filtered;
  }, [allFiles, year, selectedType]);

  // ✅ Get content types for column
  const { data: contentTypesData } = useGetContentTypesQuery({
    lang: i18n.language,
    skip: 0,
    take: 100,
  });

  const contentTypes = contentTypesData?.data ?? [];

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: Column<any>[] = [
    {
      header: t("file_display_name"),
      key: "fileName",
      className: "w-[35%]",
      render: (file) => (
        <div className="flex items-center gap-4 py-2">
          <div className="p-3 bg-orange-50 text-blue-600 rounded-2xl shadow-sm">
            <FileText size={20} />
          </div>

          <div className="flex flex-col cursor-pointer">
            <span
              className="font-bold text-slate-800"
              onClick={() =>
                window.open(
                  file.url ||
                    `http://localhost:3000/uploads/${file.storageKey}`,
                  "_blank",
                )
              }
            >
              {file.displayName}
            </span>

            <span className="text-[10px] text-slate-400 uppercase">
              {file.mimeType}
            </span>
          </div>
        </div>
      ),
    },

    // ✅ Content Type Column
    {
      header: t("content_type"),
      key: "contentType",
      className: "w-[20%]",
      render: (file) => {
        const type = contentTypes.find(
          (ct) => String(ct.id) === String(file.contentTypeId),
        );
        return (
          <span className="text-slate-500 font-bold">
            {type?.name || "---"}
          </span>
        );
      },
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
      key: "actions",
      className: "w-[30%] text-right",
      render: (file) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleDownload(file.url, file.displayName)}
            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => setFileedit(file)}
            className="p-2 bg-red-50 text-red-500 rounded-xl"
          >
            <Edit2 size={18} />
          </button>

          <button
            onClick={() => handleDeleteClick(file.id)}
            className="p-2 bg-red-50 text-red-500 rounded-xl"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#fafafa] min-h-[60vh]">
      <nav className="flex items-center gap-2 mb-8 text-sm font-bold">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-orange-500"
        >
          <Home size={16} />
        </button>

        <ChevronRight size={14} className="text-slate-300" />

        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-orange-500"
        >
          {t("all_files")}
        </button>

        <ChevronRight size={14} className="text-slate-300" />

        <span className="text-orange-600 uppercase">{year}</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 uppercase">
          {year} {t("collection")}
        </h1>
      </div>

      <div className="flex justify-end mb-4">
        <ContentTypeFilter
          contentTypes={contentTypes}
          selectedType={selectedType}
          onChange={setSelectedType}
        />
      </div>
      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={yearFiles}
          isLoading={isLoading}
          emptyMessage={t("no_files_found")}
        />

        {fileEdit && (
          <EditFileModal data={fileEdit} onClose={() => setFileedit(null)} />
        )}
      </div>
    </div>
  );
};

export default FileYearDetails;
