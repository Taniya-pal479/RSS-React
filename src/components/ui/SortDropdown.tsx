import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Props } from "../../types";
import { useTranslation } from "react-i18next";

const SortDropdown = ({ options, selectedSort, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const currentLabel =
    options.find((opt) => opt.value === selectedSort)?.label || t("sortBy");

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        className={`flex items-center rounded-xl border mx-4 px-3 py-1.5 transition-all shadow-sm bg-white ${
          currentLabel !== t("sortBy")
            ? "border-orange-500 bg-orange-50/30"
            : "border-gray-200"
        }`}
      >
        {selectedSort && (
          <button
            onClick={() => {
              onChange(currentLabel);
              setIsOpen(false);
            }}
            className="mr-2 text-gray-400 hover:text-red-500 transition-colors  "
          >
            {currentLabel !== t("sortBy") && <X size={16} strokeWidth={3} />}
          </button>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`text-sm font-bold outline-none ${
            currentLabel !== t("sortBy")
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-500"
          }`}
        >
          {currentLabel}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-12 left-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 py-2">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer text-sm font-semibold transition-colors ${
                selectedSort === option.value
                  ? "text-orange-600 bg-orange-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
