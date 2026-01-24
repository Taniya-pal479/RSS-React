import React, { useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAddContentTypeMutation } from '../../services/rssApi';
import { ArrowLeft, Save, Loader2, Calendar, Layout } from 'lucide-react';
import { toast } from 'react-toastify';

interface ApiError {
  data?: {
    message?: string;
  };
}

const ContentTypeForm: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId: urlCategoryId } = useParams();
  const { t, i18n } = useTranslation();

  // Use the global language from i18next
  const globalLang = i18n.language;

  const [addContentType, { isLoading }] = useAddContentTypeMutation();

  const [categoryId, setCategoryId] = useState<string>(urlCategoryId || '1');
  const [contentYear, setContentYear] = useState<number>(new Date().getFullYear());

  // Store translations for all languages
  const [translations, setTranslations] = useState<Record<string, { name: string; description: string }>>({
    en: { name: '', description: '' },
    hi: { name: '', description: '' },
  });

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

    if (translationPayload.length === 0) {
      toast.warn(t("error_name_required") || "Name is required");
      return;
    }

    const payload = {
      categoryId: Number(categoryId),
      subcategoryId: null,
      contentYear: Number(contentYear),
      translations: translationPayload,
    };

    try {
      await addContentType(payload).unwrap();
      toast.success(t("save_success") || "Content Type added successfully!");
      navigate(-1);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.data?.message || "Failed to save content type");
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto bg-[#fdfcfb] p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-600 shadow-sm border border-transparent hover:border-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl md:text-[28px] font-bold text-[#1a1a1a]">
          {t("add_new_content_type") || "Add Content Type"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Responsive Grid for Meta Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
              <Layout size={16} /> {t("category_id")}
            </label>
            <input
              type="number"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-[#f9fafb] border border-gray-100 rounded-[14px] outline-none focus:border-[#f97316] transition-all"
              required
            />
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
              <Calendar size={16} /> {t("content_year")}
            </label>
            <input
              type="number"
              value={contentYear}
              onChange={(e) => setContentYear(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#f9fafb] border border-gray-100 rounded-[14px] outline-none focus:border-[#f97316] transition-all"
              required
            />
          </div>
        </div>

        {/* Translation Fields - Controlled by Global Language Toggle */}
        <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-8">
          <div>
            <label className="block text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
              {t("fileName")} ({globalLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={translations[globalLang]?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={globalLang === 'hi' ? "श्रेणी का नाम" : "Category Name"}
              className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[18px] text-[16px] outline-none focus:border-[#f97316] transition-all font-medium"
              required={globalLang === 'en'}
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
              {t("description")} ({globalLang.toUpperCase()})
            </label>
            <textarea
              value={translations[globalLang]?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={globalLang === 'hi' ? "विवरण" : "Description"}
              className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[18px] text-[16px] outline-none focus:border-[#f97316] transition-all min-h-[140px] resize-none"
            />
          </div>
        </div>

        {/* Responsive Footer Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#f97316] text-white font-bold rounded-[18px] hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-100 disabled:opacity-50 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            <span className="text-[17px]">{t("save_content_type") || "Save Content Type"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentTypeForm;