import React from 'react';
import { useParams  } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Music, Image as ImageIcon, Download, MoreVertical, FileCode } from 'lucide-react';
import DataTable, { type Column } from '../../components/common/DataTable';
import { useGetSubCategoriesQuery } from '../../services/rssApi';
import type { SubCategory,FileResponse } from '../../types';

 
 

const SubCategoryDetail = () => {
  const { subCategoryId } = useParams();
    const { categoryId } = useParams();
  const { t,i18n } = useTranslation();
  
  
  // const { data: files = [], isLoading } = useGetFilesQuery({ subCategoryId, lang: i18n.language });
  
  const isLoading = false;  
  const files: FileResponse[] = [];  
   const { data: Subcategories = [] } = useGetSubCategoriesQuery( { categoryId: categoryId as string,
    lang: i18n.language});
  const currentSubCategory = Subcategories.find((c: SubCategory) => Number(c.id) === Number(subCategoryId));

  //type base icon selection
  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (ext === 'pdf') return <FileText className="text-red-500" />;
    if (ext === 'mp3' || ext === 'wav') return <Music className="text-purple-500" />;
    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext)) return <ImageIcon className="text-blue-500" />;
    return <FileCode className="text-gray-500" />;
  };

 
 const columns: Column<FileResponse>[] = [
  {
    header: t("name"),
    key: "name",
    className: "w-[40%]", 
    render: (file) => (
      <div className="flex items-center gap-4">
        <div className="p-3 bg-orange-50 rounded-2xl group-hover:bg-white transition-colors">
          {getFileIcon(file.extension)}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-700 truncate max-w-[250px]">{file.name}</span>
          <span className="text-[10px] text-gray-400 font-medium italic">{t('added_recently')}</span>
        </div>
      </div>
    )
  },
  {
    header: t("extension"),
    key: "extension",
    className: "w-[10%] text-center",  
    render: (file) => (
      <span className="uppercase text-xs font-black text-gray-400 tracking-widest">
        {file.extension}
      </span>
    )
  },
  {
    header: t("size"),
    key: "size",
    className: "w-[10%] text-center",  
    render: (file) => (
      <span className="text-sm font-bold text-gray-500">
        {file.size}
      </span>
    )
  },
  {
    header: t("data_year"),
    key: "year",
    className: "w-[15%] text-center",
    render: (file) => (
      <div className="relative inline-block">
        <span className="px-4 py-1.5 bg-orange-100/50 text-orange-700 text-xs font-black rounded-full border border-orange-100">
          {file.year}
        </span>
      </div>
    )
  },
  {
    header: t("latest_update"),
    key: "updated_at",
    className: "w-[20%]",  
    render: (file) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-gray-500 uppercase shrink-0">
          {file.updated_at.substring(0, 2)}
        </div>
        <span className="text-sm font-bold text-gray-600 truncate">{file.updated_at}</span>
      </div>
    )
  },
  {
    header: "",
    key: "actions",
    className: "w-[5%] text-right",  
    render: (file) => (
      <div className="flex justify-end items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => window.open(file.url, '_blank')}
          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
        >
          <Download size={18} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          <MoreVertical size={18} />
        </button>
      </div>
    )
  }
];
  return (
    <div className="p-8 bg-[#fafafa] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-3 h-14 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-200" />
          <div>
            <h1 className="text-[34px] font-black text-[#1a1a1a] tracking-tight leading-tight">
               {currentSubCategory ? t(currentSubCategory.slug, { defaultValue: currentSubCategory.name }) : t('loading')}
            </h1>
            <p className="text-gray-400 font-bold text-sm">
              {files.length} {t('items_found_in_database')}
            </p>
          </div>
        </div>
        
        
      </div>

      {/* Main Table */}
      <DataTable 
        columns={columns} 
        data={files} 
        isLoading={isLoading} 
        emptyMessage={t('no_files_uploaded_yet')} 
      />
    </div>
  );
};

export default SubCategoryDetail;