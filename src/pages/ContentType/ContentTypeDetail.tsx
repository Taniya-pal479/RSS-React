import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Download, ArrowLeft, 
  Calendar, HardDrive, Home, ChevronRight 
} from 'lucide-react';
import DataTable, { type Column } from '../../components/common/DataTable';
import { 
  useGetFilesQuery, 
  useGetCategoriesQuery,
  useGetContentTypesQuery 
} from '../../services/rssApi';
import { format } from 'date-fns';

const ContentTypeDetail = () => {
  // 1. Correctly type params to avoid TS errors
  const { categoryId, contentTypeId } = useParams<{ categoryId: string; contentTypeId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  console.log(categoryId,contentTypeId)

  // Safety Guard: Check if the ID is valid (not the literal string ":contentTypeId")
  const isValidId = contentTypeId && contentTypeId !== ':contentTypeId';

  // 2. API Queries
  const { data: files = [], isLoading: filesLoading } = useGetFilesQuery(contentTypeId!, {
    skip: !isValidId,
  });

  const { data: categories = [] } = useGetCategoriesQuery(i18n.language);
  
  const { data: contentTypes = [], isLoading: typesLoading } = useGetContentTypesQuery(
    { categoryId: categoryId ?? '', lang: i18n.language },
    { skip: !categoryId }
  );

  // 3. Memoized lookups for Header and Breadcrumbs
  const currentCategory = useMemo(() => 
    categories.find(c => String(c.id) === String(categoryId)), 
  [categories, categoryId]);

  const currentType = useMemo(() => 
    contentTypes.find(ct => String(ct.id) === String(contentTypeId)), 
  [contentTypes, contentTypeId]);

  const columns: Column<any>[] = [
    {
      header: t("FILE_NAME"),
      key: "fileName",
      className: "w-[45%]",
      render: (file) => (
        <div className="flex items-center gap-4 py-2">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-sm">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{file.fileName}</span>
            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
              {file.mimeType}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("SIZE"),
      key: "fileSize",
      className: "w-[15%]",
      render: (file) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <HardDrive size={14} className="text-slate-300" />
          {(file.fileSize / 1024).toFixed(1)} KB
        </div>
      )
    },
    {
      header: t("UPLOAD_DATE"),
      key: "uploadedAt",
      className: "w-[25%]",
      render: (file) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} className="text-slate-300" />
          <span>{format(new Date(file.uploadedAt), 'MMMM do, yyyy')}</span>
        </div>
      )
    },
    {
      header: "",
      key: "actions",
      className: "w-[15%] text-right",
      render: (file) => (
        <button 
          onClick={() => window.open(file.url, '_blank')}
          className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-100"
        >
          <Download size={18} />
        </button>
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
        <button 
            onClick={() => navigate(-1)} 
            className="text-slate-400 hover:text-orange-500"
        >
          {currentCategory?.name || t('content_type')}
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-orange-600 uppercase tracking-widest">
            {currentType?.name || t('loading')}
        </span>
      </nav>
 
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
          {currentType ? currentType.name : t('loading')}
        </h1>
      </div>
 
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={files} 
          isLoading={filesLoading || typesLoading} 
          emptyMessage={t('no_files_for_this_type')} 
        />
      </div>
    </div>
  );
};

export default ContentTypeDetail;