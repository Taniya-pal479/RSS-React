import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAddCategoryMutation, useAddSubCategoryMutation } from '../../services/rssApi';
import { ArrowLeft, Save, Loader2, Globe, ChevronDown, Check } from 'lucide-react';
import type { Translation } from '../../types';
import { toast } from 'react-toastify';

interface ApiError {
  data?: {
    message?: string;
  };
}

const SUPPORTED_LANGS = [
  { code: 'en', name: 'English', filename: "Category Name", description: "Description" },
  { code: 'hi', name: 'हिन्दी', filename: "श्रेणी का नाम", description: "विवरण" },
];

const CategoryForm = ({ mode }: { mode: 'category' | 'subcategory' }) => {
  const navigate = useNavigate();
  const { t ,i18n} = useTranslation();
  const { categoryId } = useParams();

  const [addCategory, { isLoading: isCatLoading }] = useAddCategoryMutation();
  const [addSubCategory, { isLoading: isSubLoading }] = useAddSubCategoryMutation();
  const isLoading = isCatLoading || isSubLoading;
  const globalLang=i18n.language;

  const [currentLangCode, setCurrentLangCode] = useState(globalLang);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [translations, setTranslations] = useState<Record<string, { name: string, description: string }>>({
    en: { name: '', description: '' },
    hi: { name: '', description: '' },
  });

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [currentLangCode]: { ...prev[currentLangCode], [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    const translationPayload: Translation[] = Object.entries(translations)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, data]) => data.name.trim() !== '') // Only send languages that have a name
      .map(([code, data]) => ({
        languageCode: code,
        name: data.name.trim(),
        description: data.description.trim()
      }));

    if (translationPayload.length === 0) {
      alert("Please enter at least one name.");
      return;
    }
 
    const slug = (translations.en.name || translations.hi.name)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

try {
  let targetId: string | number;

  if (mode === 'category') {
   
    const result = await addCategory({ 
      slug, 
      translations: translationPayload 
    }).unwrap();
    
    targetId = result.id;  
  } else {
    await addSubCategory({
      categoryId: Number(categoryId),
      slug,
      translations: translationPayload
    }).unwrap();
    
    targetId = categoryId!;  
  }

  toast.success(t("save_success"));

   
  navigate(`/category/${targetId}`, { 
    state: { name: translations[currentLangCode].name } 
  });

} catch (err) {
  console.log(err)
  toast.error("Failed to save");
}
  };

  const currentLang = SUPPORTED_LANGS.find(l => l.code === currentLangCode);

  return (
    <div className="max-w-[800px] mx-auto bg-white rounded-[24px] border border-gray-100 p-10 shadow-sm">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[28px] font-bold text-[#1a1a1a]">
            {mode === 'category' ? t("title") : t("Subtitle") }
          </h1>
        </div>

        <div className="relative  hidden">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            <Globe size={18} className="text-[#f97316]" />
            {currentLang?.name}
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
              {SUPPORTED_LANGS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => { setCurrentLangCode(lang.code); setIsLangOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-orange-50 transition-colors"
                >
                  {lang.name}
                  {translations[lang.code]?.name && <Check size={14} className="text-green-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="relative p-8 rounded-[20px] border-2 border-dashed border-orange-100 bg-white">
          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-bold text-gray-400 mb-2.5 ml-1">
                 {t("fileName")}
              </label>
              <input
                type="text"
                value={translations[currentLangCode]?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                
                className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[14px] text-[16px] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-orange-50 transition-all"
                required={currentLangCode === 'en'} // Require English as primary
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-400 mb-2.5 ml-1">
               {t("description")}
              </label>
              <textarea
                value={translations[currentLangCode]?.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                 
                className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-[14px] text-[16px] outline-none focus:border-[#f97316] transition-all min-h-[140px] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-3 px-10 py-4 bg-[#f97316] text-white font-bold rounded-[14px] hover:bg-[#ea580c] transition-all shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] disabled:opacity-50 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="text-[17px]">{t("save_record") || "Save Record"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;