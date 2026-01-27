import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Globe, Check, ChevronDown, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
// Added useGetContentTypesQuery to fetch fresh data for the selected language
import { useUpdateContentTypeMutation, useGetContentTypesQuery } from "../../services/rssApi";
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
  const [currentLangCode, setCurrentLangCode] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);

  // 1. Fetch data specifically for the selected language from the API
  // This ensures that when you toggle to 'hi', we get the Hindi data from the server
  const { data: refreshedList, isFetching } = useGetContentTypesQuery({
    lang: currentLangCode,
    categoryId: data?.categoryId 
  }, { skip: !data?.id });

  const [updateContentType, { isLoading: isUpdating }] = useUpdateContentTypeMutation();

  // Local state for the fields
  const [formData, setFormData] = useState({ name: "", description: "" });

  // 2. Update the fields whenever the API returns new data for the selected language
  useEffect(() => {
    if (refreshedList && Array.isArray(refreshedList)) {
      const currentItem = refreshedList.find((item: any) => String(item.id) === String(data.id));
      if (currentItem) {
        setFormData({
          name: currentItem.name || "",
          description: currentItem.description || ""
        });
      }
    }
  }, [refreshedList, data.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct payload. Note: You might want to send only the current language 
    // or maintain a map if the API expects all translations at once.
    const translationPayload = [{
      languageCode: currentLangCode,
      name: formData.name.trim(),
      description: formData.description.trim(),
    }];

    try {
      await updateContentType({
        id: data.id.toString(),
        body: {
          status: data?.status || "PUBLISHED",
          translations: translationPayload,
        },
      }).unwrap();

      toast.success(t("CONTENT_TYPE_UPDATED"));
      onClose();
    } catch (err: any) {
      toast.error(t("ERROR_UPDATING") || "Failed to update");
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
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Show a loader inside the form if the API is still fetching the specific language data */}
            {isFetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#f97316]" size={32} />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                    {t("name")} ({currentLangCode.toUpperCase()}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#f97316] font-bold"
                    required={currentLangCode === "en"}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                    {t("description")} ({currentLangCode.toUpperCase()}) <span className="text-gray-300 ml-1 font-normal lowercase">({t("optional")})</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#f97316] min-h-[120px] resize-none font-medium"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isUpdating || isFetching}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#f97316] text-white font-bold rounded-2xl hover:bg-[#ea580c] shadow-lg disabled:opacity-50 transition-all"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {t("save_changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContentTypeModal;