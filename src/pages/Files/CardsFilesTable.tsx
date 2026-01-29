import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Download, Calendar, 
  HardDrive, Home, ChevronRight,
  Image as ImageIcon, FileCheck, X
} from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector } from '../../hook/store';
import { useGetAllFilesQuery } from '../../services/rssApi';
import DataTable, { type Column } from '../../components/common/DataTable';

const CardsFilesTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // 1. Get the 'type' from URL: e.g., /results?type=media
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('type'); 
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);

  const { data: files = [], isLoading } = useGetAllFilesQuery();

  // 2. Logic to filter data based on URL and Search Bar
  const filteredData = useMemo(() => {
    return files.filter((f) => {
      const extension = f.fileName?.split('.').pop()?.toUpperCase() || '';
      const imageExtensions = ['JPG', 'JPEG', 'PNG', 'WEBP'];
      const docExtensions = ['PDF', 'DOC', 'DOCX', 'TXT', 'CSV', 'XLS', 'XLSX'];

      // filter by URL type
      let matchesType = true;
      if (filterType === 'media') {
        matchesType = imageExtensions.includes(extension) || f.mimeType?.startsWith('image/');
      } else if (filterType === 'docs') {
        matchesType = docExtensions.includes(extension);
      } else if (filterType === 'reports') {
        // Logic for reports (e.g., specific naming convention or metadata)
        matchesType = f.fileName?.toLowerCase().includes('report');
      }

      // filter by global search query
      const matchesSearch = searchQuery 
        ? f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true;

      return matchesType && matchesSearch;
    });
  }, [files, filterType, searchQuery]);

  // 3. Dynamic Title based on filter
  const getHeaderTitle = () => {
    switch (filterType) {
      case 'media': return t("total_media") || "Media Files";
      case 'docs': return t("total_documents") || "Documents";
      case 'reports': return t("active_reports") || "Reports";
      default: return t("all_files") || "All Files";
    }
  };

  const columns: Column<any>[] = [
    {
      header: t("file_display_name"),
      key: "fileName",
      className: "w-[45%]",
      render: (file: any) => {
        const ext = file.fileName?.split('.').pop()?.toUpperCase();
        const isImg = ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext);

        return (
          <div className="flex items-center gap-4 py-2 group">
            <div className={`p-3 rounded-2xl shadow-sm transition-colors ${isImg ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
              {isImg ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>
            <div 
              className="flex flex-col cursor-pointer" 
            onClick={() => navigate(`/category/${file.categoryId}/content-type/${file.contentTypeId}`)}
            >
              <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                {file.fileName}
              </span>
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                {ext || 'FILE'} • {file.mimeType || 'UNKNOWN'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: t("size"),
      key: "fileSize",
      className: "w-[15%]",
      render: (file: any) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <HardDrive size={14} className="text-slate-300" />
          <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
        </div>
      )
    },
    {
      header: t("upload_date"),
      key: "uploadedAt",
      className: "w-[20%]",
      render: (file: any) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} className="text-slate-300" />
          <span>
            {file.uploadedAt ? format(new Date(file.uploadedAt), 'MMM dd, yyyy') : "—"}
          </span>
        </div>
      )
    },
    {
      header: t("actions"),
      key: "actions",
      className: "w-[20%] text-right",
      render: (file: any) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => window.open(file.url, '_blank')}
            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-100 active:scale-90"
          >
            <Download size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-bold">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-orange-500 transition-colors">
          <Home size={16} />
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-orange-600 uppercase tracking-widest">
          {getHeaderTitle()}
        </span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
            <FileCheck size={36} className="text-orange-500" />
            {getHeaderTitle()}
          </h1>
          <p className="text-slate-400 font-medium mt-2">
            {filteredData.length} {t("items_found")} 
            {searchQuery && (
              <> {t("for")} <span className="text-slate-800 font-bold">"{searchQuery}"</span></>
            )}
          </p>
        </div>

        {/* Clear Filter button if type exists */}
        {filterType && (
          <button 
            onClick={() => navigate('/results')} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 text-sm font-bold transition-all shadow-sm"
          >
            <X size={16} />
            {t("clear_filters") || "View All Files"}
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DataTable 
          columns={columns} 
          data={filteredData} 
          isLoading={isLoading} 
          emptyMessage={t("no_results_found")} 
        />
      </div>
    </div>
  );
};

export default CardsFilesTable;