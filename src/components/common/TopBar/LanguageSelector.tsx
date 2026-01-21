import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../hook/store";
import { setLanguage } from "../../../store/slices/uiSlice";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation(); // Added t here
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code); 
    dispatch(setLanguage(code)); 
    setIsOpen(false);
  };

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:border-saffron-300 hover:bg-white transition-all duration-200"
      >
        <Globe size={18} className="text-saffron-600" />
        <span className="text-sm font-bold text-gray-700 uppercase">{currentLang.name}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in duration-200">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t("languages")} {/* Replaced hardcoded "Select Language" */}
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLangChange(lang.code)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-saffron-50 hover:text-saffron-700 transition-colors"
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{lang.name}-{lang.code} </span>
              </div>
              {i18n.language === lang.code && <Check size={14} className="text-saffron-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;