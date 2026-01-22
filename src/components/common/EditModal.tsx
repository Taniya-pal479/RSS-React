import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Globe, Check, ChevronDown, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  useUpdateCategoryMutation,
  useUpdateSubCategoryMutation,
} from "../../services/rssApi";
import type { Translation } from "../../types";

const SUPPORTED_LANGS = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
];

interface EditModalProps {
  type: "category" | "subcategory";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onClose: () => void;
}

const EditModal = ({ type, data, onClose }: EditModalProps) => {
  const { t } = useTranslation();
  const [updateCategory, { isLoading: isUpdatingCat }] =
    useUpdateCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdatingSub }] =
    useUpdateSubCategoryMutation();
  const isLoading = isUpdatingCat || isUpdatingSub;

  const [currentLangCode, setCurrentLangCode] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Initialize translations with existing data
  const [translations, setTranslations] = useState(() => {
    const initialData: Record<string, { name: string; description: string }> = {
      en: { name: "", description: "" },
      hi: { name: "", description: "" },
    };

    if (data?.translations && Array.isArray(data.translations)) {
      data.translations.forEach((item: any) => {
        const code = item.lang;
        if (initialData[code]) {
          initialData[code] = {
            name: item.name || "",
            description: item.description || "",
          };
        }
      });
    }
    return initialData;
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const translationPayload: Translation[] = Object.entries(translations)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, d]) => d.name.trim() !== "")
      .map(([code, d]) => ({
        languageCode: code,
        name: d.name.trim(),
        description: d.description.trim(),
      }));

    try {
      if (type === "category") {
        await updateCategory({
          id: data.id.toString(),
          body: { slug: data.slug, translations: translationPayload },
        }).unwrap();
        toast.success(t("CATEGORY_UPDATED"));
      } else {
        await updateSubCategory({
          id: data.id.toString(),
          body: {
            slug: data.slug,
            translations: translationPayload,
            categoryId: data.categoryId,
          },
        }).unwrap();
        toast.success(t("SUBCATEGORY_UPDATED"));
      }
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorCode = err?.data?.message || "DEFAULT_ERROR";
      toast.error(t(`${errorCode}`));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[550px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">
            {type === "category" ? t("edit_category") : t("edit_subcategory")}
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-2 border-amber-500 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                <Globe size={14} className="text-[#f97316]" />
                {SUPPORTED_LANGS.find((l) => l.code === currentLangCode)?.name}
                <ChevronDown size={14} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                  {SUPPORTED_LANGS.map((lang) => {
                    const isActive = currentLangCode === lang.code;

                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setCurrentLangCode(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors
            ${isActive ? "bg-orange-50 text-[#f97316]" : "hover:bg-gray-50 text-gray-600"}
          `}
                      >
                        <div className="flex items-center gap-2">
                          {lang.name}
                        </div>

                        {isActive && (
                          <Check
                            size={14}
                            className="text-green-500"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                {t("fileName")}
              </label>
              <input
                type="text"
              value={translations[currentLangCode]?.name || ""}
                onChange={(e) => {
                  const newName = e.target.value;
                  setTranslations((prev) => ({
                    ...prev,
                    [currentLangCode]: {
                      ...prev[currentLangCode],
                      name: newName,
                    },
                  }));
                }}
                className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#f97316] font-bold"
                required={currentLangCode === "hi"}
                
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                {t("description")}
              </label>
              <textarea
                value={translations[currentLangCode].description} // Changed from defaultValue to value
                onChange={(e) => {
                  const newDesc = e.target.value;
                  setTranslations((prev) => ({
                    ...prev,
                    [currentLangCode]: {
                      ...prev[currentLangCode],
                      description: newDesc,
                    },
                  }));
                }}
                className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#f97316] min-h-[120px] resize-none font-medium"
                 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#f97316] text-white font-bold rounded-2xl hover:bg-[#ea580c] shadow-lg shadow-orange-100 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {t("save_changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
