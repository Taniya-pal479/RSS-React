import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  contentTypes: any[];
  selectedType: string | null;
  onChange: (value: string | null) => void;
};

const ContentTypeFilter = ({ contentTypes, selectedType, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center rounded-xl border px-3 py-1.5 transition-all shadow-sm bg-white ${
          selectedType ? "border-orange-500 bg-orange-50/30" : "border-gray-200"
        }`}
      >
        {selectedType && (
          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className="mr-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            {!selectedType && (
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            )}
            <X size={16} strokeWidth={3} />
          </button>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`text-sm font-bold outline-none ${
            selectedType
              ? "text-orange-600"
              : "text-slate-600 hover:text-orange-500"
          }`}
        >
          {selectedType
            ? contentTypes.find((ct) => String(ct.id) === selectedType)?.name
            : t("filter_by_content_type", "Filter by Content Type")}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[999] overflow-hidden">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
            <div
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 cursor-pointer text-sm font-bold rounded-lg ${
                !selectedType
                  ? "bg-orange-60 text-orange-600"
                  : "hover:bg-orange-50 text-slate-600"
              }`}
            >
              All
            </div>

            {contentTypes.map((ct) => {
              const isActive = String(ct.id) === selectedType;
              return (
                <div
                  key={ct.id}
                  onClick={() => {
                    onChange(String(ct.id));
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer text-sm font-bold rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "hover:bg-orange-50 text-slate-600"
                  }`}
                >
                  {ct.name}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentTypeFilter;
