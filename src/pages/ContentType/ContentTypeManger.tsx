import React, { useState, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import ContentTabs, { type ContentType } from '../../components/common/ContentTabs';
import DataTable from '../../components/common/DataTable';

export const ContentManager = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ContentType>('documents');

  const allData = [
    { id: 1, name: "Customer_Onboarding.pdf", type: 'documents', path: "/Docs", date: "2 hours ago" },
    { id: 2, name: "Product_Hero.png", type: 'media', path: "/Images", date: "Yesterday" },
    { id: 3, name: "Q1_Marketing_Report.xlsx", type: 'reports', path: "/Fin", date: "Jan 07, 2025" },
  ];

  const filteredData = useMemo(() => {
    return allData.filter(item => item.type === activeTab);
  }, [activeTab, allData]);

  // Use translation keys for headers
  const columns = [
    { header: t("fileName"), key: "name", className: "w-1/3" },
    { header: t("category_path"), key: "path" },
    { header: t("last_updated"), key: "date" },
  ];

  return (
    <div className="p-8 bg-[#fdfcfb] min-h-screen">
      <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <DataTable 
        columns={columns} 
        data={filteredData} 
        // Example: "No documents found" using dynamic translation keys
        emptyMessage={`${t("no_data_found")} (${t(activeTab)})`}
      />
    </div>
  );
};