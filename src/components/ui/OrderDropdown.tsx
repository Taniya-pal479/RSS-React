import { useState, useEffect, useRef } from "react";
import { X, SortAsc, SortDesc } from "lucide-react";
import { useTranslation } from "react-i18next";

type OrderType = "asc" | "desc" | null;

interface OrderDropdownProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

const OrderDropdown = ({ value, onChange }: OrderDropdownProps) => {
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

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        className={`flex items-center rounded-xl border mr-4 px-3 py-1.5 transition-all shadow-sm bg-white ${
          value ? "border-orange-500 bg-orange-50/30" : "border-gray-200"
        }`}
      >
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              setIsOpen(false);
            }}
            className="mr-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={16} strokeWidth={3} />
          </button>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`text-sm font-bold outline-none flex items-center gap-2 ${
            value ? "text-orange-600" : "text-slate-600 hover:text-orange-500"
          }`}
        >
          {value === "asc" ? (
            <SortAsc size={18} className="text-orange-500" />
          ) : value === "desc" ? (
            <SortDesc size={18} className="text-orange-500" />
          ) : null}

          <span>{value || t("orderBy")}</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-12 right-0 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 py-2">
          <div
            onClick={() => {
              onChange("asc");
              setIsOpen(false);
            }}
            className={`px-4 py-2 cursor-pointer text-sm font-semibold flex items-center gap-2 ${
              value === "asc"
                ? "text-orange-600 bg-orange-50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SortAsc size={14} /> {t("ascending")}
          </div>

          <div
            onClick={() => {
              onChange("desc");
              setIsOpen(false);
            }}
            className={`px-4 py-2 cursor-pointer text-sm font-semibold flex items-center gap-2 ${
              value === "desc"
                ? "text-orange-600 bg-orange-50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SortDesc size={14} /> {t("descending")}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDropdown;
