import React, { useMemo } from 'react';
import { useAppSelector } from '../hook/store';
import { useGetFilesQuery } from '../services/rssApi';
import DataTable from '../components/common/DataTable';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Calendar, HardDrive } from 'lucide-react';
import { format } from 'date-fns';

const SearchResultsPage = () => {
  const { t } = useTranslation();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  
  // Note: Pass "all" or handle your API to fetch all searchable files
  const { data: files = [], isLoading } = useGetFilesQuery("all"); 

  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    return files.filter((file: any) =>
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const columns = [
    {
      header: t("file_display_name"),
      key: "fileName",
      render: (file: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FileText size={18} /></div>
          <span className="font-bold text-slate-800">{file.fileName}</span>
        </div>
      )
    },
    {
      header: t("size"),
      key: "fileSize",
      render: (file: any) => (
        <div className="flex items-center gap-2 text-gray-500">
          <HardDrive size={14} />
          <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
        </div>
      )
    },
    {
      header: t("upload_date"),
      key: "uploadedAt",
      render: (file: any) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={14} />
          <span>{format(new Date(file.uploadedAt), 'MMM dd, yyyy')}</span>
        </div>
      )
    },
    {
      header: "",
      key: "actions",
      className: "text-right",
      render: (file: any) => (
        <button onClick={() => window.open(file.url, '_blank')} className="p-2 bg-orange-500 text-white rounded-lg">
          <Download size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 uppercase">
          {t("search_results")}
        </h1>
        <p className="text-gray-500">
          {filteredResults.length} {t("items_found_for")} "{searchQuery}"
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={filteredResults} 
          isLoading={isLoading} 
          emptyMessage={t("no_results_found")} 
        />
      </div>
    </div>
  );
};

export default SearchResultsPage;