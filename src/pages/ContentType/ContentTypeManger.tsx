import { useState, useRef, useEffect } from "react"; // Added useRef
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual"; // Added
import {
  useDeleteContentTypeMutation,
  useGetContentTypesQuery,
} from "../../services/rssApi";
import { toast } from "react-toastify";
import EditContentTypeModal from "../../components/common/EditContentTypeModal";
import ConfirmToast from "../../components/ui/ConfirmToast";
import type { ContentTypeMapped } from "../../types";
import { useAppSelector } from "../../hook/store";

export const ContentTypeManager = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const CategoryId = categoryId || "1";
  const [selectedItem, setSelectedItem] = useState<ContentTypeMapped | null>(
    null,
  );

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const parentRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const {
    data: contentTypesData,
    isLoading,
    isFetching,
  } = useGetContentTypesQuery(
    {
      lang: i18n.language,
      skip: page * rowsPerPage,
      take: rowsPerPage,
    },
    { skip: !isAuthenticated },
  );

  const contentTypes = contentTypesData?.data ?? [];
  const totalCount = contentTypesData?.total ?? 0;

  console.log("CT", contentTypes);

  const [deleteContentType] = useDeleteContentTypeMutation();

  const rowVirtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    const isAtBottom = lastItem.index >= contentTypes.length - 1;
    const hasMoreData = contentTypes.length < totalCount;

    if (isAtBottom && hasMoreData && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [virtualItems, isFetching, contentTypes.length, totalCount]);
  const handleDeleteClick = (id: number) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          message={t("confirm_delete_msg")}
          onConfirm={() => executeDelete(id)}
          closeToast={closeToast}
        />
      ),
      { position: "top-center", autoClose: false, className: "rounded-2xl" },
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
      console.log("Error deleting content ", err);
      toast.error(t("ERROR_DELETING"));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-[#f97316]" size={32} />
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
          className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white font-bold rounded-xl"
        >
          <Plus size={20} /> {t("add_new")}
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
          <div className="col-span-1">#</div>
          <div className="col-span-4">{t("content_type_name")}</div>
          <div className="col-span-5">{t("description")}</div>
          <div className="col-span-2 text-right">{t("actions")}</div>
        </div>

        <div
          ref={parentRef}
          className="overflow-y-auto custom-scrollbar"
          style={{ height: "500px" }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const item = contentTypes[virtualRow.index];

              if (!item) {
                return (
                  <div
                    key={`loading-${virtualRow.index}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-center px-6 border-b border-gray-50 text-gray-300 italic text-sm"
                  >
                    {t("loading")}...
                  </div>
                );
              }
              const activeTranslation = item.translations?.find(
                (tr) => tr.languageCode === i18n.language,
              );
              const displayName = activeTranslation?.name || item.name || "---";

              return (
                <div
                  key={item.id}
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
                    #{virtualRow.index + 1}
                  </div>
                  <div
                    className="col-span-4 font-bold text-[#1a1a1a] text-[15px] truncate pr-4 cursor-pointer hover:text-orange-600"
                    onClick={() =>
                      navigate(
                        `/category/${categoryId}/content-type/${item.id}`,
                      )
                    }
                  >
                    {displayName}
                  </div>
                  <div className="col-span-5 text-gray-400 text-sm truncate pr-4">
                    {activeTranslation?.description ||
                      item.description ||
                      "---"}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-2 text-[#f97316] hover:bg-white rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="p-2 text-red-500 hover:bg-white rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
