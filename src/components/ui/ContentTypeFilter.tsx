import { useState } from "react";

type Props = {
  contentTypes: any[];
  selectedType: string | null;
  onChange: (value: string | null) => void;
};

const ContentTypeFilter = ({ contentTypes, selectedType, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-semibold hover:text-orange-500"
      >
        {selectedType
          ? contentTypes.find((ct) => String(ct.id) === selectedType)?.name
          : "Filter by Content Type"}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-60 bg-white border border-gray-100 rounded-xl shadow-lg z-10">
          <div
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className="px-4  py-2 hover:bg-orange-50 cursor-pointer text-sm mb-10"
          >
            All
          </div>

          {contentTypes.map((ct) => (
            <div
              key={ct.id}
              onClick={() => {
                onChange(String(ct.id));
                setIsOpen(false);
              }}
              className="px-4 py-2  hover:bg-orange-50 cursor-pointer text-sm"
            >
              {ct.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentTypeFilter;
