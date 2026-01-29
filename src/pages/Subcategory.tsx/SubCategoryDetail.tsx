import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Music, Image as ImageIcon, Download, 
  FileCode, Home, ChevronRight, HardDrive, Calendar, Trash2 
} from 'lucide-react';
import DataTable, { type Column } from '../../components/common/DataTable';
import { 
  useGetSubCategoriesQuery, 
  useGetFilesQuery,
  useDeleteFileMutation // Added this
} from '../../services/rssApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ConfirmToast from '../../components/ui/ConfirmToast';
import type { SubCategory } from '../../types';

const SubCategoryDetail = () => {
  const { subCategoryId, categoryId } = useParams<{ subCategoryId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: files = [], isLoading: filesLoading } = useGetFilesQuery(subCategoryId!, {
    skip: !subCategoryId || subCategoryId === ':subCategoryId',
  });

  const { data: subCategories = [], isLoading: subCatLoading } = useGetSubCategoriesQuery({ 
    categoryId: categoryId as string, 
    lang: i18n.language 
  });

  const [deleteFile] = useDeleteFileMutation();

  const handleDeleteClick = (id: number) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          message={t("confirm_delete_msg")}
          onConfirm={() => executeDelete(id)}
          closeToast={closeToast}
        />
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        className: 'rounded-2xl shadow-2xl border border-gray-100',
      }
    );
  };

  const executeDelete = async (id: number) => {
    try {
      await deleteFile(id).unwrap();
      toast.success(t("DELETED_SUCCESSFULLY"));
    } catch (err) {
      toast.error(t("ERROR_DELETING"));
    }
  };

  const currentSubCategory = useMemo(() => 
    subCategories.find((c: SubCategory) => String(c.id) === String(subCategoryId)), 
  [subCategories, subCategoryId]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={20} className="text-red-500" />;
    if (ext === 'mp3' || ext === 'wav') return <Music size={20} className="text-purple-500" />;
    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext || '')) return <ImageIcon size={20} className="text-blue-500" />;
    return <FileCode size={20} className="text-gray-500" />;
  };

  const columns: Column<any>[] = [
    {
      header: t("file_display_name"),
      key: "fileName",
      className: "w-[40%]",
      render: (file) => (
        <div className="flex items-center gap-4 py-2">
          <div className="p-3 bg-orange-50 rounded-2xl shadow-sm">
            {getFileIcon(file.fileName)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
              {file.fileName}
            </span>
            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase italic">
              {file.mimeType || t('added_recently')}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("size"),
      key: "fileSize",
      className: "w-[15%]",
      render: (file) => (
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <HardDrive size={14} className="text-slate-300" />
          {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : '---'}
        </div>
      )
    },
    {
      header: t("upload_date"),
      key: "uploadedAt",
      className: "w-[20%]",
      render: (file) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} className="text-slate-300" />
          <span>{file.uploadedAt ? format(new Date(file.uploadedAt), 'MMMM do, yyyy') : '---'}</span>
        </div>
      )
    },
    {
      header: t("actions"),
      key: "actions",
      className: "w-[25%] text-right",
      render: (file) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => window.open(file.url, '_blank')}
            className="p-2 bg-orange-500 text-white rounded-xl bg-orange-600 transition-all shadow-md shadow-orange-100"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={() => handleDeleteClick(file.id)}
            className="p-2  text-red-500 rounded-xl hover:text-gray-300 transition-colors"
          >
            <Trash2 size={18} />
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
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-orange-500">
          {t('back')}
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-orange-600 uppercase tracking-widest">
          {currentSubCategory?.name || t('loading')}
        </span>
      </nav>

      <div className="mb-10 flex items-center gap-5">
        <div className="w-3 h-14 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-200" />
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
            {currentSubCategory ? currentSubCategory.name : t('loading')}
          </h1>
          <p className="text-gray-400 font-bold text-sm">
            {files.length} {t('items_found_in_database')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={files} 
          isLoading={filesLoading || subCatLoading} 
          emptyMessage={t('no_files_uploaded_yet')} 
        />
      </div>
    </div>
  );
};

export default SubCategoryDetail;