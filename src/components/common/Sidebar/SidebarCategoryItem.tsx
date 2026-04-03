import {
  Layers,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetSubCategoriesQuery } from "../../../services/rssApi";
import type { Category, SubCategory } from "../../../types/index";
import { useAppSelector } from "../../../hook/store";

interface SidebarCategoryItemProps {
  category: Category;
  isCategoryOpen: boolean;
  onToggle: () => void;
}

const SidebarCategoryItem = ({
  category,
  isCategoryOpen,
  onToggle,
}: SidebarCategoryItemProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleCategoryClick = () => {
    onToggle();

    navigate(`/category/${category.id}`);
  };

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const {
    data: subCategoriesData,
    isLoading,
    isFetching,
  } = useGetSubCategoriesQuery(
    {
      categoryId: category.id,
      lang: i18n.language,
      skip: 0,
      take: 1000,
    },
    {
      skip: !isCategoryOpen,
      refetchOnMountOrArgChange: true,
    },
  );
  const subCategories = Array.isArray(subCategoriesData)
    ? subCategoriesData
    : subCategoriesData?.result || [];

  return (
    <div className="mb-1">
      <button
        onClick={handleCategoryClick}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all duration-200 group cursor-pointer ${
          isCategoryOpen
            ? "bg-gray-50 text-gray-900"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <Layers
            size={20}
            className={
              isCategoryOpen
                ? "text-[#F97316]"
                : "text-gray-400 group-hover:text-gray-600"
            }
          />
          <span className="truncate max-w-[130px] capitalize">
            {t("", { defaultValue: category.name || "" })}
          </span>
        </div>
        {isCategoryOpen ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>

      {isCategoryOpen && (
        <div className="ml-4 pl-4 border-l border-[#FED7AA] my-1 space-y-1">
          {isLoading || isFetching ? (
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400">
              <Loader2 size={10} className="animate-spin" /> {t("loading")}...
            </div>
          ) : subCategories.length > 0 ? (
            subCategories.map((sub: SubCategory) => (
              <button
                key={sub.id}
                className="flex items-center gap-2 w-full text-left text-xs font-medium text-gray-500 hover:text-[#F97316] py-2 px-2 rounded-lg hover:bg-[#FFF7ED]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                <span
                  className="truncate"
                  onClick={() =>
                    navigate(`/category/${category.id}/subcategory/${sub.id}`)
                  }
                >
                  {t(" ", { defaultValue: sub.name || "" })}
                </span>
              </button>
            ))
          ) : (
            <div className="px-2 py-1 text-[10px] text-gray-400 italic">
              {t("no_subcategories")}
            </div>
          )}

          <button
            onClick={() => navigate(`/add-subcategory/${category.id}`)}
            className="text-xs text-[#F97316] flex items-center gap-1 pl-2 py-1 hover:underline font-medium mt-1 cursor-pointer"
          >
            <PlusCircle size={12} /> {t("Add_new")}
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarCategoryItem;
