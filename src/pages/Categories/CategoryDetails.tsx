import React, { useState, useMemo } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { Plus, Trash2, Edit3, Folder, FileText, Download } from "lucide-react";

import {
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useDeleteCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetFilesByCategoryQuery,
  useDeleteFileMutation,
} from "../../services/rssApi";

import type { Category, FileObject, SubCategory } from "../../types";

import { toast } from "react-toastify";

import EditModal from "../../components/common/EditModal";

import DataTable, { type Column } from "../../components/common/DataTable";

import ConfirmToast from "../../components/ui/ConfirmToast";

import EditFileModal from "../../components/common/EditFileModal";

import { useDownload } from "../../hook/useDownload";
import TablePagination from "../../components/common/TablePagination";

interface ApiError {
  data?: { message?: string };
}

type TableItem =
  | (SubCategory & {
      itemType: "subcategory";
      tableId: string;
      icon: React.ReactNode;
      displayType: string;
      displayName: string;
    })
  | (FileObject & {
      itemType: "file";
      tableId: string;
      icon: React.ReactNode;
      displayType: string;
      displayName: string;
    });

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { handleDownload } = useDownload();
  const [isEditCatOpen, setIsEditCatOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [fileEdit, setFileedit] = useState<FileObject | null>();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteSubCategory] = useDeleteSubCategoryMutation();
  const [rowsPerPage, setRowsPerPage] = useState(20); // Start with 20
  const [page, setPage] = useState(1);

  // We divide by 2 because we are calling TWO different APIs
  const ROWS_PER_TYPE = Math.floor(rowsPerPage / 2);

  const { data: categoriesData } = useGetCategoriesQuery(
    { lang: i18n.language, skip: 0, take: 1000 },

    {
      skip: !categoryId || isNaN(Number(categoryId)),
      refetchOnMountOrArgChange: true,
    },
  );

  const categories = categoriesData?.data || [];

  const currentCategory = categories.find(
    (c: Category) => Number(c.id) === Number(categoryId),
  );

  console.log("categoryId", categoryId);

  const { data: subCat, isLoading } = useGetSubCategoriesQuery(
    {
      categoryId: categoryId as string,
      lang: i18n.language,
      skip: (page - 1) * ROWS_PER_TYPE,
      take: ROWS_PER_TYPE,
    },
    { refetchOnMountOrArgChange: true },
  );

  const totalSubCats = subCat?.total || 0;

  const { data: filesData, isLoading: filesLoading } =
    useGetFilesByCategoryQuery(
      {
        catId: categoryId!,
        lang: i18n.language,
        skip: (page - 1) * ROWS_PER_TYPE, // Page 1 skips 0, Page 2 skips 10
        take: ROWS_PER_TYPE,
      },
      { skip: !categoryId, refetchOnMountOrArgChange: true },
    );

  console.log("newFiles", filesData?.total);
  console.log("subCatt", subCat?.total);

  const totalFiles = filesData?.total ?? 0;

  const maxTotal = Math.max(totalSubCats, totalFiles);
  const totalPages = Math.ceil(maxTotal / ROWS_PER_TYPE);

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

  const combinedData = useMemo(() => {
    const currentSubs = subCat?.result || [];
    const currentFiles = filesData?.files || [];

    return [
      ...currentSubs.map((sub) => ({
        ...sub,
        tableId: `sub-${sub.id}`,
        displayName: sub.name,
        displayType: "SUBCATEGORY",
        itemType: "subcategory",
        icon: "subcategory",
      })),
      ...currentFiles.map((file) => ({
        ...file,
        tableId: `file-${file.id}`,
        displayName: file.displayName,
        displayType: "FILE",
        itemType: "file",
        icon: "file",
      })),
    ];
  }, [subCat, filesData]);

  console.log("Combined Data", combinedData);

  const columns: Column<FileObject>[] = [
    {
      header: t("name_label"),

      key: "displayName",

      className: "px-10 py-6 font-bold text-gray-700",

      render: (item: FileObject) => {
        const IconNode =
          item.icon === "subcategory" ? (
            <Folder size={18} className="text-orange-500" />
          ) : (
            <FileText size={18} className="text-blue-500" />
          );

        return (
          <div className="flex items-center gap-3">
            {IconNode}

            <span
              onClick={() => handleRowClick(item)}
              className="truncate max-w-[250px] cursor-pointer hover:text-orange-600"
            >
              {item.displayName}
            </span>
          </div>
        );
      },
    },

    {
      header: t("description"),

      key: "description",

      className: "px-10 py-6 text-gray-500 text-sm",

      render: (item: FileObject) =>
        item.description ? (
          <span className="text-gray-400 text-[14px] line-clamp-1">
            {item.description}
          </span>
        ) : (
          "---"
        ),
    },

    {
      header: t("type"),

      key: "displayType" as keyof FileObject,

      className: "px-10 py-6",

      render: (item: FileObject) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            item.displayType === "SUBCATEGORY"
              ? "bg-orange-50 text-orange-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {item.displayType === "SUBCATEGORY"
            ? item.displayType
            : item.fileType}
        </span>
      ),
    },

    {
      header: t("actions"),

      key: "actions" as keyof FileObject,

      className: "px-10 py-6 text-right",

      render: (item: FileObject) => (
        <div className="flex justify-end items-center gap-4">
          {item.itemType === "subcategory" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  setEditingSub({
                    ...item,

                    name: item.displayName || item.name || "",
                    translations:
                      item.translations?.map((t) => ({
                        ...t,
                        languageCode: t.languageCode,
                        name: t.displayName || "",
                      })) || [],
                  } as unknown as SubCategory);
                }}
                className="p-2 hover:text-gray-300 text-[#f97316] transition-colors cursor-pointer"
              >
                <Edit3 size={18} />
              </button>

              <button
                onClick={(e) => handleDeleteSubCategory(e, item.id)}
                className="p-2 hover:text-gray-300 text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleDownload(item.url, item.displayName)}
                className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-100 cursor-pointer"
              >
                <Download size={18} />
              </button>

              <button
                onClick={() => {
                  setFileedit(item);

                  console.log(item);
                }}
                className="p-2 hover:text-gray-300 text-[#f97316] transition-colors cursor-pointer"
              >
                <Edit3 size={18} />
              </button>

              <button
                onClick={() => handleDeleteClick(item.id)}
                className="p-2 hover:text-gray-300 text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleDeleteCategory = () => {
    toast.warn(
      <ConfirmToast
        message={t("confirm_delete_msg")}
        onConfirm={async () => {
          try {
            await deleteCategory(categoryId as string).unwrap();

            toast.success(t("CATEGORY_DELETED"));

            navigate("/dashboard");
          } catch (err) {
            const error = err as ApiError;

            toast.error(t(`${error?.data?.message || "DEFAULT_ERROR"}`));
          }
        }}
      />,

      { position: "top-center", autoClose: false, closeOnClick: false },
    );
  };

  const handleDeleteSubCategory = (
    e: React.MouseEvent,

    subId: number | string,
  ) => {
    e.stopPropagation();

    toast.warn(
      <ConfirmToast
        message={t("confirm_delete_msg")}
        onConfirm={async () => {
          try {
            await deleteSubCategory(subId.toString()).unwrap();

            toast.success(t("SUBCATEGORY_DELETED"));
          } catch (err) {
            console.log(err);

            toast.error(t("CATEGORY_HAS_SUBCATEGORIES"));
          }
        }}
      />,

      { position: "top-center", autoClose: false, closeOnClick: false },
    );
  };

  const handleRowClick = (item: FileObject) => {
    if (item.itemType === "subcategory") {
      navigate(`/category/${categoryId}/subcategory/${item.id}`);
    } else {
      window.open(item.url, "_blank");
    }
  };

  return (
    <div className="p-8 bg-[#fafafa] min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-12 bg-[#f97316] rounded-full" />

          <div>
            <h1 className="text-[32px] font-black text-[#1a1a1a]">
              {currentCategory
                ? t("", { defaultValue: currentCategory.name })
                : t("loading")}
            </h1>

            <p className="text-gray-400 text-sm">
              {combinedData.length} {t("items_found")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditCatOpen(true)}
            className="flex items-center gap-2 px-5 py-4 border-2 border-orange-100 text-[#f97316] font-bold rounded-2xl hover:bg-orange-50 transition-all cursor-pointer"
          >
            <Edit3 size={20} />{" "}
            <span className="hidden sm:inline">{t("update")}</span>
          </button>

          <button
            onClick={handleDeleteCategory}
            className="flex items-center gap-2 px-5 py-4 border-2 border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all cursor-pointer"
          >
            <Trash2 size={20} />{" "}
            <span className="hidden sm:inline">{t("delete")}</span>
          </button>

          <button
            onClick={() => navigate(`/add-subcategory/${categoryId}`)}
            className="flex items-center gap-2 px-7 py-4 bg-[#f97316] text-white font-bold rounded-2xl shadow-lg hover:bg-[#ea580c] transition-all cursor-pointer"
          >
            <Plus size={22} strokeWidth={3} /> <span>{t("Add_new")}</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns as any}
        onRowClick={handleRowClick}
        data={combinedData}
        isLoading={(isLoading || filesLoading) && combinedData.length === 0}
        emptyMessage={t("no_subcategories")}
      />

      {!isLoading && !filesLoading && (totalSubCats > 0 || totalFiles > 0) && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          rowsPerPage={20}
          options={[20, 40, 100]}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(1);
          }}
        />
      )}

      {fileEdit && (
        <EditFileModal data={fileEdit} onClose={() => setFileedit(null)} />
      )}

      {isEditCatOpen && currentCategory && (
        <EditModal
          type="category"
          data={currentCategory}
          onClose={() => setIsEditCatOpen(false)}
        />
      )}

      {editingSub && (
        <EditModal
          type="subcategory"
          data={editingSub}
          onClose={() => setEditingSub(null)}
        />
      )}
    </div>
  );
};

export default CategoryDetail;
