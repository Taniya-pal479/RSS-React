import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Globe, Check, ChevronDown, Save, Loader2, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { useUpdateContentTypeMutation } from "../../services/rssApi";
import type { Translation } from "../../types";

const SUPPORTED_LANGS = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
];

interface EditContentTypeModalProps {
  data: any;
  onClose: () => void;
}

const EditContentTypeModal = ({ data, onClose }: EditContentTypeModalProps) => {
  const { t } = useTranslation();
  const [updateContentType, { isLoading }] = useUpdateContentTypeMutation();

  const [currentLangCode, setCurrentLangCode] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);
  
 
  const [contentYear, setContentYear] = useState(data?.contentYear || data?.year || "");
  const [status, setStatus] = useState(data?.status || "PUBLISHED");

 
  const [translations, setTranslations] = useState(() => {
    const initialData: Record<string, { name: string; description: string }> = {
      en: { name: "", description: "" },
      hi: { name: "", description: "" },
    };

    if (data?.translations && Array.isArray(data.translations)) {
      data.translations.forEach((item: Translation) => {
        const code = item.languageCode;
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
      .filter(([_, d]) => d.name.trim() !== "")  
      .map(([code, d]) => ({
        languageCode: code,
        name: d.name.trim(),
        description: d.description.trim(),
      }));

    try {
      await updateContentType({
        id: data.id.toString(),
        body: { 
          contentYear: Number(contentYear),
          status: status,
          translations: translationPayload  
        },
      }).unwrap();
      
      toast.success(t("CONTENT_TYPE_UPDATED"));
      onClose();
    } catch (err) {
      console.error("Update Error:", err); 
      toast.error(t("ERROR_DELETING"));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[550px] rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
         
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">
            {t("edit_content_type")}
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
                  {SUPPORTED_LANGS.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setCurrentLangCode(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors
                        ${currentLangCode === lang.code ? "bg-orange-50 text-[#f97316]" : "hover:bg-gray-50 text-gray-600"}
                      `}
                    >
                      {lang.name}
                      {currentLangCode === lang.code && <Check size={14} className="text-green-500" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>
 
        <form onSubmit={handleUpdate} className="p-8 space-y-5">
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1 flex items-center gap-1">
              <Calendar size={12} /> {t("contentYear")}
            </label>
            <input
              type="number"
              value={contentYear}
              readOnly
              onChange={(e) => setContentYear(e.target.value)}
              className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#f97316] font-bold"
              required
            />
          </div>

          <hr className="border-gray-100" />

 
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                {t("name")} ({currentLangCode.toUpperCase()})
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
                required={currentLangCode === "en"} 
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                {t("description")} ({currentLangCode.toUpperCase()})
              </label>
              <textarea
                value={translations[currentLangCode]?.description || ""}
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
                className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#f97316] min-h-[100px] resize-none font-medium"
              />
            </div>
          </div>
 
          <div className="flex gap-3 pt-4">
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
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {t("save_changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContentTypeModal;