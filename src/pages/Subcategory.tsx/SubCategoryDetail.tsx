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
  Edit3,
  Plus,
  Folder,
  ImageIcon,
  BarChart3,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
} from "lucide-react";

import DataTable, { type Column } from "../../components/common/DataTable";
import {
  useGetFilesBySubcategoryQuery,
  useGetSubCategoriesQuery,
  useDeleteFileMutation,
  useGetSubCategoriesChildrenQuery,
  useGetSubCategoryByIdQuery,
} from "../../services/rssApi";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ConfirmToast from "../../components/ui/ConfirmToast";
import type { FileObject, SubCategory } from "../../types";
import EditFileModal from "../../components/common/EditFileModal";
import { useDownload } from "../../hook/useDownload";
import TablePagination from "../../components/common/TablePagination";

const SubCategoryDetail = () => {
  const { subCategoryId, categoryId } = useParams<{
    subCategoryId: string;
    categoryId: string;
  }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [fileEdit, setFileedit] = useState<FileObject | null>();
  const { handleDownload } = useDownload();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data: subCategoryData } = useGetSubCategoryByIdQuery({
    subCategoryId: Number(subCategoryId),
    lang: i18n.language,
  });
  console.log("id", subCategoryId);

  const { data: filesData, isLoading: filesLoading } =
    useGetFilesBySubcategoryQuery(
      {
        subCatId: subCategoryId!,
        lang: i18n.language,
        skip: (page - 1) * rowsPerPage,
        take: rowsPerPage,
      },
      {
        skip: !subCategoryId || subCategoryId === "undefined",
      },
    );
  const totalFiles = filesData?.total || 0;
  const totalPages = Math.ceil(totalFiles / rowsPerPage);
  const files = filesData?.data || [];

  const { data: subCategoriesData, isLoading: subCatLoading } =
    useGetSubCategoriesChildrenQuery({
      parentId: subCategoryId,
      lang: i18n.language,
      skip: 0,
      take: 1000,
    });

  const subCategories = subCategoriesData?.result || [];

  const currentSubCategory = useMemo(
    () =>
      subCategories.find(
        (s: SubCategory) => String(s.id) === String(subCategoryId),
      ),
    [subCategories, subCategoryId],
  );

  const combinedData = useMemo(() => {
    const currentSubs = subCategoriesData?.data || [];
    const currentFiles = filesData?.data || [];

    const mappedSubs = currentSubs.map((sub: any) => ({
      ...sub,
      tableId: `sub-${sub.id}`,
      displayName: sub.name || "",
      itemType: "subcategory",
    }));

    const mappedFiles = currentFiles.map((file: any) => ({
      ...file,
      tableId: `file-${file.id}`,
      displayName: file.displayName,
      itemType: "file",
    }));

    return [...mappedSubs, ...mappedFiles];
  }, [subCategoriesData, filesData]);

  console.log(combinedData);

  const [deleteFile] = useDeleteFileMutation();

  const executeDelete = async (id: number) => {
    try {
      await deleteFile(id).unwrap();
      toast.success(t("DELETED_SUCCESSFULLY"));
    } catch (err) {
      console.error(err);
      toast.error(t("ERROR_DELETING"));
    }
  };

  const handleDeleteClick = (id: number) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          message={t("confirm_delete_msg")}
          onConfirm={() => executeDelete(id)}
          closeToast={closeToast}
        />
      ),
      { position: "top-center", autoClose: false },
    );
  };

  const getFileIcon = (ext: string) => {
    if (!ext) return File;

    const imageExts = ["JPG", "JPEG", "PNG", "WEBP", "SVG"];
    const videoExts = ["MP4", "MOV", "AVI", "WEBM"];
    const audioExts = ["MP3", "WAV", "OGG"];
    const excelExts = ["XLS", "XLSX", "XLSM", "CSV"];
    const codeExts = ["JS", "TS", "HTML", "CSS", "JSON", "XML"];
    const archiveExts = ["ZIP", "RAR", "7Z"];

    if (imageExts.includes(ext)) return FileImage;
    if (videoExts.includes(ext)) return FileVideo;
    if (audioExts.includes(ext)) return FileAudio;
    if (excelExts.includes(ext)) return FileSpreadsheet;
    if (archiveExts.includes(ext)) return FileArchive;
    if (codeExts.includes(ext)) return FileCode;
    if (ext === "PDF" || ext === "DOC" || ext === "DOCX" || ext === "TXT")
      return FileText;

    return File; // default
  };

  const columns: Column<FileObject>[] = [
    {
      header: t("file_display_name"),
      key: "fileName",
      className: "w-[40%]",
      render: (file) => {
        const exturl = file.url || "";
        const ext = exturl.split(".").pop()?.split(/\?|#/)[0]?.toUpperCase();
        console.log(ext, "exxt");
        const Icon = getFileIcon(ext);
        const isImg = file.itemType === "file" && file.fileType === "IMAGE";
        const isReport = file.itemType === "file" && file.fileType === "REPORT";
        const isSubcategory = file.itemType === "subcategory";
        return (
          <div className="flex items-center gap-4 py-2">
            <div
              className={`p-2.5 rounded-xl shadow-sm transition-colors ${
                isSubcategory
                  ? "bg-orange-50 text-orange-600"
                  : isImg
                    ? "bg-orange-50 text-orange-600"
                    : isReport
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
              }`}
            >
              <Icon />
            </div>
            <div
              className="flex flex-col cursor-pointer "
              onClick={() => {
                if (file?.itemType === "subcategory") {
                  console.log("clicked link");
                  navigate(`/category/${categoryId}/subcategory/${file.id}`);
                } else {
                  const isExternal = file.url.startsWith("http");

                  if (isExternal) {
                    window.open(file.url, "_blank");
                  } else {
                    const baseUrl =
                      "https://rss-file-storage-ayush001.s3.ap-south-1.amazonaws.com/";
                    window.open(`${baseUrl}${file.url}`, "_blank");
                  }
                }
              }}
            >
              <span className="font-bold text-slate-800  hover:text-orange-600">
                {file.displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-black uppercase italic">
                {file.mimeType}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: t("type"),

      key: "tableId",

      className: "px-10 py-6",

      render: (item) => {
        const exturl = item.url || "";
        const ext = exturl.split(".").pop()?.split(/\?|#/)[0]?.toUpperCase();

        return (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              item.itemType === "subcategory"
                ? "bg-orange-50 text-orange-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {item.itemType === "subcategory" ? item.itemType : ext}
          </span>
        );
      },
    },

    {
      header: t("size"),
      key: "fileSize",
      className: "w-[15%]",
      render: (file) => {
        return (
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <HardDrive size={14} className="text-slate-300" />
            {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)}KB` : "---"}
          </div>
        );
      },
    },

    {
      header: t("upload_date"),
      key: "uploadedAt",
      className: "w-[20%]",
      render: (file) => {
        return (
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar size={14} className="text-slate-300" />
            {file?.itemType !== "subcategory" ? (
              <span>{format(new Date(file.uploadedAt), "MMMM do, yyyy")}</span>
            ) : (
              <span>-</span>
            )}
          </div>
        );
      },
    },
    {
      header: t("actions"),
      key: "id",
      className: "w-[25%] text-right",
      render: (file) => (
        <div
          className="flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleDownload(file.url, file.displayName)}
            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md cursor-pointer"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => {
              setFileedit(file);
            }}
            className="p-2 hover:text-gray-300 text-[#f97316] transition-colors cursor-pointer"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(file.id)}
            className="p-2 text-red-500 rounded-xl hover:bg-red-50 cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen">
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
          {t("category")}
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-orange-600 uppercase tracking-widest">
          {subCategoryData?.name || t("loading")}
        </span>
      </nav>

      <div className="mb-10 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="w-3 h-14 bg-linear-to-b from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-200" />
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase">
              {subCategoryData ? subCategoryData.name : t("loading")}
            </h1>
            <p className="text-gray-400 font-bold text-sm">
              {files.length} {t("items_found")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate(
                `/category/${categoryId}/subcategory/${subCategoryId}/add-subcategory`,
              )
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-saffron-600 text-white font-bold rounded-xl shadow-lg hover:bg-saffron-700 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={22} strokeWidth={3} />
            <span>{t("Add_new_subcategory")}</span>
          </button>
          <button
            onClick={() => navigate(`/upload/${categoryId}/${subCategoryId}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-saffron-600 text-white font-bold rounded-xl shadow-lg hover:bg-saffron-700 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            {t("upload_file") || "Add Ingestion"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={combinedData}
          isLoading={filesLoading || subCatLoading}
          emptyMessage={t("no_files_uploaded_yet")}
        />

        {!filesLoading && files.length > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newSize) => {
              setRowsPerPage(newSize);
              setPage(1); // Always reset to page 1 on size change
            }}
          />
        )}

        {fileEdit && (
          <EditFileModal data={fileEdit} onClose={() => setFileedit(null)} />
        )}
      </div>
    </div>
  );
};

export default SubCategoryDetail;
