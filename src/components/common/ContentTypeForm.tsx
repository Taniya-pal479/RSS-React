import React, { useState, useEffect,useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useAddContentTypeMutation, 
  useUpdateContentTypeMutation,
  useGetCategoriesQuery, 
  useGetSubCategoriesQuery,
  useGetContentTypesQuery 
} from '../../services/rssApi';
import { ArrowLeft, Save, Loader2, Layout, ChevronDown, Layers, FileText, AlignLeft } from 'lucide-react';
import { toast } from 'react-toastify';

interface ApiError {
  data?: { message?: string };
}

const ContentTypeForm: React.FC = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const globalLang = i18n.language;

  // Attempt to get categoryId from navigation state if editing
  const queryParams = new URLSearchParams(location.search);
  const urlCatId = queryParams.get('categoryId') || '';
  

  const [addContentType, { isLoading: isAdding }] = useAddContentTypeMutation();
  const [updateContentType, { isLoading: isUpdating }] = useUpdateContentTypeMutation();
  
   
  const { data: contentTypesList = [] } = useGetContentTypesQuery(
    { categoryId: urlCatId, lang: globalLang }, 
    { skip: !id || !urlCatId }
  );

  const itemToEdit = useMemo(() => {
    return contentTypesList.find(item => String(item.id) === String(id));
  }, [id, contentTypesList]);

  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedSubCatId, setSelectedSubCatId] = useState('');
  const [translations, setTranslations] = useState<Record<string, { name: string; description: string }>>({
    en: { name: '', description: '' },
    hi: { name: '', description: '' },
  });

  const { data: categories = [] } = useGetCategoriesQuery(globalLang);
  const { data: subCategories = [] } = useGetSubCategoriesQuery(
    { categoryId: selectedCatId, lang: globalLang },
    { skip: !selectedCatId }
  );
 
useEffect(() => {
    if (itemToEdit && selectedCatId === '') {
      setSelectedCatId(String(itemToEdit.categoryId));
      // Fixed the naming error here (subcategory instead of subcategoryId)
      setSelectedSubCatId(itemToEdit.subcategory ? String(itemToEdit.subcategory) : '');
      
      const newTrans = { en: { name: '', description: '' }, hi: { name: '', description: '' } };
      if (itemToEdit.translations) {
        itemToEdit.translations.forEach((trans: any) => {
          newTrans[trans.languageCode as keyof typeof newTrans] = {
            name: trans.name,
            description: trans.description || ''
          };
        });
      } else {
          newTrans[globalLang as keyof typeof newTrans] = {
              name: itemToEdit.name || '',
              description: itemToEdit.description || ''
          };
      }
      setTranslations(newTrans);
    }
  }, [itemToEdit, globalLang, selectedCatId]);

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [globalLang]: { ...prev[globalLang], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const translationPayload = Object.entries(translations)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, data]) => data.name.trim() !== '')
      .map(([code, data]) => ({
        languageCode: code,
        name: data.name.trim(),
        description: data.description.trim(),
      }));

    if (!selectedCatId) {
      toast.warn(t("error_category_required") || "Please select a category");
      return;
    }

    const payload = {
      categoryId: Number(selectedCatId),
      subcategoryId: selectedSubCatId ? Number(selectedSubCatId) : null,
      translations: translationPayload,
    };

    try {
      if (id) {
        
        await updateContentType({ id, body: payload }).unwrap();
        toast.success(t("update_success") || "Updated successfully!");
      } else {
        await addContentType(payload).unwrap();
        toast.success(t("save_success") || "Saved successfully!");
      }
      navigate(-1);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.data?.message || "Failed to save");
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <div className="w-full max-w-[800px] mx-auto bg-[#fdfcfb] p-4 md:p-6 min-h-screen">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-600 shadow-sm border border-transparent hover:border-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-[28px] font-bold text-[#1a1a1a]">
            {id ? t("edit_content_type") : t("add_new_content_type")}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
   
        <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
              <FileText size={16} /> {t("name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={translations[globalLang]?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[18px] text-[16px] outline-none focus:border-[#f97316] transition-all font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
              <AlignLeft size={16} /> {t("description")} <span className="text-gray-300 ml-1 font-normal lowercase">({t("optional")})</span>
            </label>
            <textarea
              value={translations[globalLang]?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[18px] text-[16px] outline-none focus:border-[#f97316] transition-all min-h-[140px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-3">
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
              <Layout size={16} /> {t("category")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-3 bg-[#f9fafb] border border-gray-100 rounded-[14px] outline-none focus:border-[#f97316] transition-all appearance-none font-bold text-slate-700"
                value={selectedCatId}
                onChange={(e) => {
                  setSelectedCatId(e.target.value);
                  setSelectedSubCatId(''); 
                }}
                required
              >
                <option value="">{t('category_placeholder')}</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Conditional Subcategory Select */}
          {selectedCatId && subCategories.length > 0 && (
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                <Layers size={16} /> {t("subcategory")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 bg-[#f9fafb] border border-gray-100 rounded-[14px] outline-none focus:border-[#f97316] transition-all appearance-none font-bold text-slate-700"
                  value={selectedSubCatId}
                  onChange={(e) => setSelectedSubCatId(e.target.value)}
                  required
                >
                  <option value="">{t('subcategory_placeholder')}</option>
                  {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          )}
        </div>
        </div>

        {/* SECTION 2: CATEGORY & SUBCATEGORY (MAPPING GLOBAL UPLOAD LOGIC) */}
         

        {/* ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#f97316] text-white font-bold rounded-[18px] hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-100 disabled:opacity-50 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            <span className="text-[17px]">{id ? t("update_content_type") : t("save_content_type")}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentTypeForm;