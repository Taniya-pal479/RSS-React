import React from 'react';
import { useTranslation } from "react-i18next";
import { FileText, Image, BarChart2 } from 'lucide-react';

export type ContentType = 'documents' | 'media' | 'reports';

interface ContentTabsProps {
  activeTab: ContentType;
  onTabChange: (tabId: ContentType) => void;
}

const ContentTabs = ({ activeTab, onTabChange }: ContentTabsProps) => {
  const { t } = useTranslation();

  // Define tabs inside to use the 't' function
  const tabs = [
    { id: 'documents' as ContentType, label: t("documents"), icon: <FileText size={16} /> },
    { id: 'media' as ContentType, label: t("media"), icon: <Image size={16} /> },
    { id: 'reports' as ContentType, label: t("reports"), icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
              ${isActive 
                ? 'bg-[#f97316] text-white shadow-lg shadow-orange-200' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ContentTabs;