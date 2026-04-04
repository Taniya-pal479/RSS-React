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
  Loader2,
  Search,
  X,
  Calendar,
} from "lucide-react";

import DataTable, { type Column } from "../../components/common/DataTable";
import {
  useGetContentTypesQuery,
  useDeleteFileMutation,
  useGetSearchFilesQuery,
} from "../../services/rssApi";

import { toast } from "react-toastify";
import ConfirmToast from "../../components/ui/ConfirmToast";
import EditFileModal from "../../components/common/EditFileModal";
import type { FileObject } from "../../types";
import { useDownload } from "../../hook/useDownload";
import { useAppSelector } from "../../hook/store";
import ContentTypeFilter from "../../components/ui/ContentTypeFilter";
import SortDropdown from "../../components/ui/SortDropdown";
import OrderDropdown from "../../components/ui/OrderDropdown";
import { useDebounce } from "../../hook/useDebounce";
import TablePagination from "../../components/common/TablePagination";

const FileYearDetails = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Filter & UI State
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc" | null>(null);
  const [fileEdit, setFileedit] = useState<FileObject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { handleDownload } = useDownload();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const skip = (page - 1) * rowsPerPage;

  const sortOptions = [
    { label: t("date_updated"), value: "updatedAt" },
    { label: t("file_size"), value: "fileSize" },
    { label: t("original_name"), value: "name" },
  ];

  /** * QUERY 1: Base Year Data
   * Fetches the default list for the year with sorting. Skips when searching.
   */
  const { data: baseData, isLoading: isBaseLoading } = useGetSearchFilesQuery(
    {
      search: "",
      lang: i18n.language,
      skip,
      take: rowsPerPage,
      year: year ? Number(year) : undefined,
      sortBy,
      order,
    },
    { skip: !isAuthenticated || !!debouncedSearch.trim() },
  );

  /** * QUERY 2: Search Results
   * Fetches filtered results when user types. Skips when search is empty.
   */
  const { data: searchData, isFetching: isSearchFetching } =
    useGetSearchFilesQuery(
      {
        search: debouncedSearch,
        lang: i18n.language,
        skip,
        take: rowsPerPage,
        year: year ? Number(year) : undefined,
        sortBy,
        order,
      },
      { skip: !isAuthenticated || !debouncedSearch.trim() },
    );

  // Switch logic to decide which data to display
  const isSearching = !!debouncedSearch.trim();
  const rawFiles = isSearching
    ? searchData?.files || []
    : baseData?.files || [];
  const totalCount = isSearching
    ? searchData?.total || 0
    : baseData?.total || 0;

  // Client-side Content Type filter (Year/Search/Sort/Order are already server-side)
  const displayFiles = useMemo(() => {
    if (!selectedType) return rawFiles;
    return rawFiles.filter(
      (f: { contentTypeId: string }) =>
        String(f.contentTypeId) === String(selectedType),
    );
  }, [rawFiles, selectedType]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const { data: contentTypesData } = useGetContentTypesQuery({
    lang: i18n.language,
    skip: 0,
    take: 1000,
  });
  const contentTypes = contentTypesData?.data ?? [];

  const [deleteFile] = useDeleteFileMutation();

  const executeDelete = async (id: number) => {
    try {
      await deleteFile(id).unwrap();
      toast.success(t("DELETED_SUCCESSFULLY"));
    } catch (err) {
      console.log(err);
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
              className="font-bold text-slate-800 hover:text-orange-600 transition-colors"
              onClick={() => window.open(file.url, "_blank")}
            >
              {file.name}
            </span>
            <span className="text-[10px] text-slate-400 uppercase">
              {file.mimeType} • {file.fileType?.replace(".", "")}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("category"),
      key: "category",
      render: (file: FileObject) => (
        <span className="font-bold text-slate-600">
          {file.metadata?.category || file.category || "---"}
        </span>
      ),
    },
    {
      header: t("content_type"),
      key: "contentType",
      render: (file) => {
        return (
          <span className="text-slate-500 font-bold">
            {file.contentType || "---"}
          </span>
        );
      },
    },
    {
      header: t("upload_date"),
      key: "uploadedAt",
      render: (file) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} className="text-slate-300" />
          <span>{file.createdAt?.split("T")[0] || "---"}</span>
        </div>
      ),
    },
    {
      header: t("size"),
      key: "fileSize",
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
      className: "text-right",
      render: (file) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleDownload(file.url, file.name)}
            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() =>
              setFileedit({
                ...file,
                displayName: file.displayName || file.name || "",
              })
            }
            className="p-2 bg-blue-50 text-blue-500 rounded-xl"
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
    <div className="p-8 bg-[#fafafa] min-h-[60vh] pb-5">
      <nav className="flex items-center gap-2 mb-8 text-sm font-bold">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-orange-500"
        >
          <Home size={16} />
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <button
          onClick={() => navigate("/year")}
          className="text-slate-400 hover:text-orange-500"
        >
          {t("all_files")}
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-orange-600 uppercase">{year}</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 uppercase">
          {year} {t("Files_Detail")}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 px-4">
        {/* Search Field - Constrained width so it doesn't squash filters */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearchFetching ? (
              <Loader2 size={18} className="text-orange-500 animate-spin" />
            ) : (
              <Search size={18} className="text-slate-400" />
            )}
          </div>
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Actions - Grouped and spaced */}
        <div className="flex flex-wrap items-center gap-3">
          <SortDropdown
            options={sortOptions}
            selectedSort={sortBy}
            onChange={setSortBy}
            // Note: If your SortDropdown has a 'clearable' prop, set it to false here
          />
          <OrderDropdown
            value={order}
            onChange={(val) => setOrder(val as "asc" | "desc")}
          />
          <ContentTypeFilter
            contentTypes={contentTypes}
            selectedType={selectedType}
            onChange={setSelectedType}
          />
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={displayFiles}
          isLoading={isBaseLoading || isSearchFetching}
          emptyMessage={t("no_files_found")}
        />

        {displayFiles.length > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(newSize) => {
              setRowsPerPage(newSize);
              setPage(1);
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

export default FileYearDetails;
