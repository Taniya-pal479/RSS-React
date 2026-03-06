import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit2, Trash2, Plus } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import {
  useDeleteContentTypeMutation,
  useGetContentTypesQuery,
} from "../../services/rssApi";
import { toast } from "react-toastify";
import EditContentTypeModal from "../../components/common/EditContentTypeModal";
import ConfirmToast from "../../components/ui/ConfirmToast";
import type { ContentTypeMapped } from "../../types";

interface TableColumn<T> {
  header: string;
  key: keyof T | string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export const ContentTypeManager = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const CategoryId = categoryId || "1";

  const [selectedItem, setSelectedItem] = useState<ContentTypeMapped | null>(
    null,
  );

  const { data: contentTypes = [], isLoading } = useGetContentTypesQuery({
    categoryId: CategoryId,
    lang: i18n.language,
  });

  const [deleteContentType] = useDeleteContentTypeMutation();

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
      await deleteContentType({
        id: Number(id),
        categoryId: CategoryId,
      }).unwrap();
      toast.success(t("DELETED_SUCCESSFULLY"));
    } catch (err) {
      console.log(err);
      toast.error(t("ERROR_DELETING"));
    }
  };

  const columns: TableColumn<ContentTypeMapped>[] = [
    {
      header: t("id"),
      key: "id",
      className: "w-16",
      render: (_, index) => {
        // Simple index-based serial number since pagination is gone
        return <span className="text-gray-400 text-[14px]">#{index + 1}</span>;
      },
    },
    {
      header: t("content_type_name"),
      key: "name",
      className: "w-1/4",
      render: (item: ContentTypeMapped) => {
        const activeTranslation = item.translations?.find(
          (tr) => tr.languageCode === i18n.language,
        );
        const displayName = activeTranslation?.name || item.name || "---";

        return (
          <span
            className="font-bold text-[#1a1a1a] text-[15px] cursor-pointer hover:text-orange-600"
            onClick={() =>
              navigate(`/category/${categoryId}/content-type/${item.id}`)
            }
          >
            {displayName}
          </span>
        );
      },
    },
    {
      header: t("description"),
      key: "description",
      render: (item: ContentTypeMapped) => {
        const activeTranslation = item.translations?.find(
          (tr) => tr.languageCode === i18n.language,
        );
        const displayDesc =
          activeTranslation?.description || item.description || "---";

        return (
          <span className="text-gray-400 text-[14px] line-clamp-1">
            {displayDesc}
          </span>
        );
      },
    },
    {
      header: t("actions"),
      key: "actions",
      className: "text-right",
      render: (item: ContentTypeMapped) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setSelectedItem(item)}
            className="p-2 hover:text-gray-300 text-[#f97316] transition-colors cursor-pointer"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(item.id)}
            className="p-2 hover:text-gray-300 text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-[#fdfcfb] min-h-[50vh]">
      <div className="flex justify-between items-end mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">
            {t("sidebar_content_type")}
          </h2>
          <p className="text-gray-400 text-sm">{t("content_type_subtitle")}</p>
        </div>

        <button
          onClick={() => navigate("/content/add")}
          className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={20} /> {t("add_new")}
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <DataTable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          columns={columns as any}
          data={contentTypes}
          onRowClick={(item) =>
            navigate(`/category/${categoryId}/content-type/${item.id}`)
          }
          emptyMessage={t("no_files_uploaded_yet")}
        />
      </div>

      {selectedItem && (
        <EditContentTypeModal
          data={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default ContentTypeManager;
