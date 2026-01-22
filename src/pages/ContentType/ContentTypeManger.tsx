import React, { useState, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '../../components/common/DataTable';

export const ContentTypeManager = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Example data (Add at least 10 items to test pagination)
  const allData = [
    { id: 1, name: "Customer Playbook", description: "Structured guides and manuals." },
    { id: 2, name: "Legal Contract", description: "Signed agreements and NDAs." },
    { id: 3, name: "Analytics Export", description: "CSV or parquet exports." },
    { id: 4, name: "Internal Memo", description: "Communication notes." },
    { id: 5, name: "Brand Guidelines", description: "Logos and color palettes." },
    { id: 6, name: "Technical Spec", description: "Architecture and API docs." },
    { id: 7, name: "Marketing Plan", description: "Social media and SEO strategy." },
  ];

  // --- FIXED PAGINATION LOGIC ---
  const totalPages = Math.ceil(allData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage; // Page 1: 0, Page 2: 5
    const endIndex = startIndex + itemsPerPage;         // Page 1: 5, Page 2: 10
    return allData.slice(startIndex, endIndex);
  }, [currentPage, allData]);

  const columns = [
    { 
      header: t("id"), 
      key: "id", 
      className: "w-16",
      render: (item: any) => <span className="text-gray-400 text-[14px]">#{item.id}</span>
    },
    { 
      header: t("content_type_name"), 
      key: "name", 
      className: "w-1/4",
      render: (item: any) => <span className="font-bold text-[#1a1a1a] text-[15px]">{item.name}</span>
    },
    { 
      header: t("description"), 
      key: "description",
      render: (item: any) => <span className="text-gray-400 text-[14px]">{item.description}</span>
    },
    {
      header: t("actions"),
      key: "actions",
      className: "text-right",
      render: (item: any) => (
        <div className="flex justify-end gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg text-sm font-semibold text-gray-500 hover:text-[#f97316]">
            <Edit2 size={14} /> {t("edit")}
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-100">
            <Trash2 size={14} /> {t("delete")}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 bg-[#fdfcfb] min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">{t("sidebar_content_type")}</h2>
           <p className="text-gray-400 text-sm">{t("content_type_subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95">
          <Plus size={20} /> {t("add_new")}
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={paginatedData} />
      </div>

      {/* Pagination Footer */}
      <div className="mt-8 flex items-center justify-between">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-[#f97316] disabled:opacity-30"
        >
          <ChevronLeft size={18} /> {t("previous")}
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${
                currentPage === i + 1 ? 'bg-[#f97316] text-white shadow-md' : 'text-gray-400 hover:bg-orange-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="flex items-center gap-1 text-sm font-bold text-[#f97316] hover:underline disabled:opacity-30"
        >
          {t("next")} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};