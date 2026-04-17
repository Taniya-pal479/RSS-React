import React, { useState, useEffect, startTransition } from "react";
import { useTranslation } from "react-i18next";
import { X, Globe, Check, ChevronDown, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useUpdateFileMutation, useGetFilesQuery } from "../../services/rssApi";

import type { FileObject } from "../../types";

const SUPPORTED_LANGS = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
];

interface EditFileModalProps {
  data: FileObject;
  onClose: () => void;
}

const EditFileModal = ({ data, onClose }: EditFileModalProps) => {
  const { t } = useTranslation();
  const [currentLangCode, setCurrentLangCode] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const { data: refreshedListData, isFetching } = useGetFilesQuery(
    {
      contentTypeId: data?.contentTypeId,
      lang: currentLangCode,
      take: 1000,
      skip: 0,
    },
    { skip: !data?.id },
  );
  const refreshedList = refreshedListData?.files ?? [];

  const [updateFile, { isLoading: isUpdating }] = useUpdateFileMutation();

  const [formData, setFormData] = useState({
    displayName: data.displayName || data.name || "",
    description: data.description || "",
  });

  useEffect(() => {
    if (refreshedList && Array.isArray(refreshedList)) {
      const currentItem = refreshedList.find(
        (item) => String(item.id) === String(data.id),
      );

      if (currentItem) {
        const newName = currentItem.displayName || "";
        const newDesc = currentItem.description || "";

        if (
          formData.displayName !== newName ||
          formData.description !== newDesc
        ) {
          startTransition(() => {
            setFormData({
              displayName: newName,
              description: newDesc,
            });
          });
        }
      }
    }
  }, [refreshedList, data.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateFile({
        id: data.id,

        body: {
          ...data,
          translations: [
            {
              languageCode: currentLangCode,
              displayName: formData.displayName.trim(),
              description: formData.description.trim(),
            },
          ],
        } as FileObject,
      }).unwrap();

      toast.success(t("FILE_UPDATED_SUCCESSFULLY"));
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(t("ERROR_UPDATING"));
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-137.5 rounded-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">{t("edit_file")}</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-2 border-orange-500 rounded-full text-xs font-bold text-gray-600"
              >
                <Globe size={14} className="text-[#f97316]" />
                {SUPPORTED_LANGS.find((l) => l.code === currentLangCode)?.name}
                <ChevronDown size={14} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2">
                  {SUPPORTED_LANGS.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setCurrentLangCode(lang.code);
                        setIsLangOpen(false);
                        console.log(formData.displayName, lang.code);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold ${currentLangCode === lang.code ? "bg-orange-50 text-[#f97316]" : "hover:bg-gray-50 text-gray-600"}`}
                    >
                      {lang.name}
                      {currentLangCode === lang.code && (
                        <Check size={14} className="text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-4">
            {isFetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#f97316]" size={32} />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                    {t("name")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:border-[#f97316]"
                    required={currentLangCode === "en"}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase mb-2 ml-1">
                    {t("description")}{" "}
                    <span className="text-slate-400 font-normal ml-1">
                      ({t("optional")})
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-[#f9fafb] border border-gray-200 rounded-2xl text-sm min-h-30 resize-none outline-none focus:border-[#f97316]"
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
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#f97316] text-white font-bold rounded-2xl hover:bg-[#ea580c] shadow-lg disabled:opacity-50"
            >
              {isUpdating ? (
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

export default EditFileModal;
