import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import flagIcon1 from "../../../../src/assets/flagIcon1.png";
import {
  LayoutDashboard,
  Settings,
  PlusCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetCategoriesQuery } from "../../../services/rssApi";
import SidebarCategoryItem from "./SidebarCategoryItem";

const NavigationSidebar = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [openCategoryId, setOpenCategoryId] = useState<number | string | null>(
    null,
  );

  // 1. Fetch the response object from RTK Query
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useGetCategoriesQuery(i18n.language);

  const isActive = (path: string) => location.pathname === path;
  const handleToggle = (id: number | string) => {
    setOpenCategoryId((prevId) => (prevId === id ? null : id));
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col py-6">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100/50 shadow-sm shrink-0">
            <img
              src={flagIcon1}
              alt="Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-black text-rose-800 tracking-tight leading-tight uppercase">
              {t("sidebarHeading")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
        <div className="space-y-1 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
              isActive("/dashboard")
                ? "bg-[#FFF7ED] text-[#F97316]"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard size={20} />
            <span>{t("dashboard")}</span>
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              {t("categories")}
            </h2>
            <button
              onClick={() => navigate("/add-category")}
              className="text-[#F97316] hover:bg-orange-50 p-1 rounded-md transition-colors"
              title={t("add_category")}
            >
              <PlusCircle size={16} />
            </button>
          </div>

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 className="animate-spin text-[#F97316]" size={20} />
              <span className="text-xs font-medium">{t("loading")}...</span>
            </div>
          )}

          {/* ERROR STATE */}
          {isError && (
            <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-100 text-center">
              <AlertCircle className="mx-auto text-red-500 mb-1" size={18} />
              <p className="text-[10px] text-red-600 font-bold mb-2">
                {t("error_loading")}
              </p>
              <button
                onClick={() => refetch()}
                className="text-[10px] bg-white border border-red-200 px-2 py-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
              >
                {t("retry")}
              </button>
            </div>
          )}

         
          {!isLoading && !isError && (
            <div className="space-y-1">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SidebarCategoryItem
                    key={category.id}
                    category={category}
                    isOpen={openCategoryId === category.id}
                    onToggle={() => handleToggle(category.id)}
                  />
                ))
              ) : (
                <div className="px-4 py-4 text-center border-2 border-dashed border-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 italic">
                    {t("no_categories")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 mt-auto pt-4 hidden">
        <button
          onClick={() => navigate("/settings")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
            isActive("/settings")
              ? "bg-[#FFF7ED] text-[#F97316]"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Settings size={20} />
          <span>{t("settings")}</span>
        </button>
      </div>
    </aside>
  );
};

export default NavigationSidebar;
