import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { useDeleteContentTypeMutation, useGetContentTypesQuery } from '../../services/rssApi';
import { toast } from 'react-toastify';
import EditContentTypeModal from '../../components/common/EditContentTypeModal';
import ConfirmToast from '../../components/ui/ConfirmToast'; // Import your reusable component

export interface ContentTypeMapped {
  categoryId?: any;
  id: number;
  name: string;
  description: string;
  year: number;
  status: string;
  translations?: any[];
}

export const ContentTypeManager = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const CategoryId = categoryId || "1";
  
  const [selectedItem, setSelectedItem] = useState<ContentTypeMapped | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: contentTypes = [], isLoading } = useGetContentTypesQuery({
    categoryId: CategoryId, 
    lang: i18n.language
  });
   
  console.log(contentTypes)
  const [deleteContentType] = useDeleteContentTypeMutation();

  const totalPages = Math.ceil(contentTypes.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return contentTypes.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, contentTypes]);

   
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
        className: 'rounded-2xl shadow-2xl border border-gray-100',
      }
    );
  };

  const executeDelete = async (id: number) => {
    try {
      await deleteContentType({ id: id.toString(), categoryId: CategoryId }).unwrap();
      toast.success(t("DELETED_SUCCESSFULLY"));
    } catch (err) {
      console.log(err)
      toast.error(t("ERROR_DELETING"));
    }
  };

 const columns = [
   { 
    header: t("id"), 
    key: "id", 
    className: "w-16",
    render: (item: ContentTypeMapped) => (
      <span className="text-gray-400 text-[14px]">#{item.id}</span>
    )
  },
  { 
    header: t("content_type_name"), 
    key: "name", 
    className: "w-1/4",
    render: (item: ContentTypeMapped) => {
  
      const activeTranslation = item.translations?.find(
        (tr: any) => tr.languageCode === i18n.language
      );

    
      const displayName = activeTranslation?.name || item.name || "---";

      return (
        <span className="font-bold text-[#1a1a1a] text-[15px]">
          {displayName}
        </span>
      );
    }
  },
  { 
    header: t("description"), 
    key: "description",
    render: (item: ContentTypeMapped) => {
      const activeTranslation = item.translations?.find(
        (tr: any) => tr.languageCode === i18n.language
      );
      const displayDesc = activeTranslation?.description || item.description || "---";

      return (
        <span className="text-gray-400 text-[14px] line-clamp-1">
          {displayDesc}
        </span>
      );
    }
  },
    {
      header: t("actions"),
      key: "actions",
      className: "text-right",
      render: (item: ContentTypeMapped) => (
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setSelectedItem(item)}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg text-sm font-semibold text-gray-500 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all"
          >
            <Edit2 size={14} /> {t("edit")}
          </button>
          <button 
            onClick={() => handleDeleteClick(item.id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> {t("delete")}
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#fdfcfb] min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">{t("sidebar_content_type")}</h2>
          <p className="text-gray-400 text-sm">{t("content_type_subtitle")}</p>
        </div>
        <button 
          onClick={() => navigate("/content/add")} 
          className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95"
        >
          <Plus size={20} /> {t("add_new")}
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={paginatedData} />
      </div>

 
      <div className="mt-8 flex items-center justify-between">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-[#f97316] disabled:opacity-30"
        >
          <ChevronLeft size={18} /> {t("previous")}
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${
                currentPage === i + 1 
                  ? 'bg-[#f97316] text-white shadow-md' 
                  : 'text-gray-400 hover:bg-orange-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button 
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(p => p + 1)}
          className="flex items-center gap-1 text-sm font-bold text-[#f97316] hover:underline disabled:opacity-30"
        >
          {t("next")} <ChevronRight size={18} />
        </button>
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