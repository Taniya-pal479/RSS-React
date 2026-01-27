import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { 
  useGetCategoriesQuery, 
  useGetSubCategoriesQuery, 
  useDeleteCategoryMutation,
  useDeleteSubCategoryMutation 
} from '../../services/rssApi';
import type { Category, SubCategory } from '../../types';
import { toast } from 'react-toastify';

// Components
import EditModal from '../../components/common/EditModal';
import DataTable from '../../components/common/DataTable';
import ConfirmToast from '../../components/ui/ConfirmToast';

interface ApiError {
  data?: { message?: string };
}

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [isEditCatOpen, setIsEditCatOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);

  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteSubCategory] = useDeleteSubCategoryMutation();
  
  const { data: categories = [] } = useGetCategoriesQuery(i18n.language);
  const currentCategory = categories.find((c: Category) => Number(c.id) === Number(categoryId));

 

  const { data: subCatResponse, isLoading } = useGetSubCategoriesQuery({
    categoryId: categoryId as string,
    lang: i18n.language
  });

  const subCategories = subCatResponse || [];

   
  const columns = [
    { 
      header: t("id"), 
      key: "id", 
      className: "px-10 py-6 text-sm font-bold text-gray-300",
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     render: (_: any, index: number) => `#${index + 1}`
    },
    { 
      header: t("name_label"), 
      key: "name", 
      className: "px-10 py-6 font-bold text-gray-700",
      render: (sub: SubCategory) => t(sub.slug, { defaultValue: sub.name || "" })
    },
    { 
      header: t("description"), 
      key: "description", 
      className: "px-10 py-6 text-gray-500 text-sm truncate max-w-[250px]",
      render: (sub: SubCategory) => sub.description || "---"
    },
    { 
      header: t("actions"), 
      key: "actions", 
      className: "px-10 py-6 text-right",
      render: (sub: SubCategory) => (
        <div className="flex justify-end items-center gap-4">
          <button onClick={() => setEditingSub(sub)} className="p-2 text-gray-300 hover:text-[#f97316] transition-colors">
            <Edit3 size={18} />
          </button>
          <button onClick={(e) => handleDeleteSubCategory(e, sub.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ];

  const handleDeleteCategory = () => {
    toast.warn(
      <ConfirmToast 
        message={t('confirm_delete_msg')} 
        onConfirm={async () => {
          try {
            await deleteCategory(categoryId as string).unwrap();
            toast.success(t('CATEGORY_DELETED'));
            navigate('/dashboard');
          } catch (err) {
            const error = err as ApiError;
            toast.error(t(`${error?.data?.message || "DEFAULT_ERROR"}`));
          }
        }} 
      />,
      { position: "top-center", autoClose: false, closeOnClick: false }
    );
  };

  const handleDeleteSubCategory = (e: React.MouseEvent, subId: number | string) => {
    e.stopPropagation();
    toast.warn(
      <ConfirmToast 
        message={t('confirm_delete_msg')} 
        onConfirm={async () => {
          try {
            await deleteSubCategory(subId.toString()).unwrap();
            toast.success(t('SUBCATEGORY_DELETED'));
          } catch (err) {
            console.log(err)
            toast.error(t('CATEGORY_HAS_SUBCATEGORIES'));
          }
        }} 
      />,
      { position: "top-center", autoClose: false, closeOnClick: false }
    );
  };

  const handleRowClick = (sub: SubCategory) => {
 navigate(`/category/${categoryId}/subcategory/${sub.id}`); 
};

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-12 bg-[#f97316] rounded-full" />
          <div>
            <h1 className="text-[32px] font-black text-[#1a1a1a]">
              {currentCategory ? t(currentCategory.slug, { defaultValue: currentCategory.name }) : t('loading')}
            </h1>
            <p className="text-gray-400 text-sm">{subCategories.length} {t('sub_categories_count')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditCatOpen(true)} className="flex items-center gap-2 px-5 py-4 border-2 border-orange-100 text-[#f97316] font-bold rounded-2xl hover:bg-orange-50 transition-all">
            <Edit3 size={20} /> <span className="hidden sm:inline">{t('update')}</span>
          </button>
          <button onClick={handleDeleteCategory} className="flex items-center gap-2 px-5 py-4 border-2 border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all">
            <Trash2 size={20} /> <span className="hidden sm:inline">{t('delete')}</span>
          </button>
          <button onClick={() => navigate(`/add-subcategory/${categoryId}`)} className="flex items-center gap-2 px-7 py-4 bg-[#f97316] text-white font-bold rounded-2xl shadow-lg hover:bg-[#ea580c] transition-all">
            <Plus size={22} strokeWidth={3} /> <span>{t('Add_new')}</span>
          </button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        onRowClick={handleRowClick}
        data={subCategories} 
        isLoading={isLoading} 
        emptyMessage={t('no_subcategories_found')} 
      />

      {isEditCatOpen && currentCategory && (
        <EditModal type="category" data={currentCategory} onClose={() => setIsEditCatOpen(false)} />
      )}
      {editingSub && (
        <EditModal type="subcategory" data={editingSub} onClose={() => setEditingSub(null)} />
      )}
    </div>
  );
};

export default CategoryDetail;