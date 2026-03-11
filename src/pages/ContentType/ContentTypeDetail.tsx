import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Download,
  Trash2,
  Calendar,
  HardDrive,
  Home,
  ChevronRight,
  Edit2,
} from "lucide-react";
import DataTable, { type Column } from "../../components/common/DataTable";
import {
  useGetFilesQuery,
  useGetCategoriesQuery,
  useGetContentTypesQuery,
  useDeleteFileMutation,
} from "../../services/rssApi";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ConfirmToast from "../../components/ui/ConfirmToast";
import EditFileModal from "../../components/common/EditFileModal";
import type { FileObject } from "../../types";
import { useDownload } from "../../hook/useDownload";

const ContentTypeDetail = () => {
  const { categoryId, contentTypeId } = useParams<{
    categoryId: string;
    contentTypeId: string;
  }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [fileEdit, setFileedit] = useState<FileObject | null>();
  const isValidId = contentTypeId && contentTypeId !== ":contentTypeId";
  const { handleDownload } = useDownload();
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const { data: files = [], isLoading: filesLoading } = useGetFilesQuery(
    {
      contentTypeId: contentTypeId!,
      lang: i18n.language,
    },
    {
      skip: !isValidId,
    },
  );

  console.log("content files ", files);

  const { data: categories = [] } = useGetCategoriesQuery(i18n.language);

  const { data: contentTypesData, isLoading: typesLoading } =
    useGetContentTypesQuery(
      {
        lang: i18n.language,
        skip: page * rowsPerPage,
        take: rowsPerPage,
      },
      { skip: !categoryId },
    );

  const contentTypes = contentTypesData?.data ?? [];
  console.log(files);

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

  const currentCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(categoryId)),
    [categories, categoryId],
  );

  const currentType = useMemo(
    () => contentTypes.find((ct) => String(ct.id) === String(contentTypeId)),
    [contentTypes, contentTypeId],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: Column<any>[] = [
    {
      header: t("file_display_name"),
      key: "fileName",
      className: "w-[40%]",
      render: (file) => (
        <div className="flex items-center gap-4 py-2">
          <div className="p-3 bg-orange-50 text-blue-600 rounded-2xl shadow-sm">
            <FileText size={20} />
          </div>
          <div className="flex flex-col cursor-pointer ">
            <span
              className="font-bold text-slate-800  group-hover:text-orange-600 transition-colors"
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
            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
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
      header: t("upload_date"),
      key: "uploadedAt",
      className: "w-[20%]",
      render: (file) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} className="text-slate-300" />
          <span>{format(new Date(file.uploadedAt), "MMMM do, yyyy")}</span>
        </div>
      ),
    },
    {
      header: t("actions"),
      key: "actions",
      className: "w-[25%] text-right",
      render: (file) => (
        <div
          className="flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleDownload(file.url, file.displayName)}
            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-100 cursor-pointer"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => {
              setFileedit(file);
            }}
            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(file.id)}
            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
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
          {currentCategory?.name || t("content_type")}
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-orange-600 uppercase tracking-widest">
          {currentType?.name || t("loading")}
        </span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
          {currentType ? currentType.name : t("loading")}
        </h1>
      </div>

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={files}
          isLoading={filesLoading || typesLoading}
          emptyMessage={t("no_files_uploaded_yet")}
        />
        {fileEdit && (
          <EditFileModal data={fileEdit} onClose={() => setFileedit(null)} />
        )}
      </div>
    </div>
  );
};

export default ContentTypeDetail;
