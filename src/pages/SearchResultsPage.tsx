import { useMemo ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Download, Calendar, 
  HardDrive, Home, ChevronRight, Search 
} from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector } from '../hook/store';
import { useGetAllFilesQuery } from '../services/rssApi';
import DataTable, { type Column } from '../components/common/DataTable';

const SearchResultsPage = () => {
  const { t} = useTranslation();
  const navigate = useNavigate();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      navigate("/"); 
    }
  }, [searchQuery, navigate]);
  
   
  const { data: files = [], isLoading } = useGetAllFilesQuery(); 
  

  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    return files.filter((file) =>
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  

  const columns: Column<any>[] = [
    {
      header: t("file_display_name"),
      key: "fileName",
      className: "w-[45%]",
      render: (file: any) => (
        <div className="flex items-center gap-4 py-2">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-sm">
            <FileText size={20} />
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => navigate(`/category/${file.categoryId}/content-type/${file.contentTypeId}`)}>
            <span className="font-bold text-slate-800  group-hover:text-orange-600">{file.fileName}</span>
            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase"    >
              {file.mimeType || 'FILE'}
            </span>
          </div>
        </div>
      )
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
            {file.uploadedAt 
              ? format(new Date(file.uploadedAt), 'MMMM do, yyyy') 
              : "—"}
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
            className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-100"
          >
            <Download size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 bg-[#fafafa] min-h-screen">
    
      <nav className="flex items-center gap-2 mb-8 text-sm font-bold">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-orange-500">
          <Home size={16} />
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-orange-600 uppercase tracking-widest">
          {t("search_results")}
        </span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
          <Search size={32} className="text-orange-500" />
          {t("search_results")}
        </h1>
        <p className="text-slate-400 font-medium mt-2">
          {filteredResults.length} {t("items_found_for")} <span className="text-slate-800 font-bold">"{searchQuery}"</span>
        </p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
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