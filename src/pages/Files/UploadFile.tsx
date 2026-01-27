import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Upload, ChevronDown, 
  FileText, Copy, Check, Loader2, X 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  useGetCategoriesQuery, 
  useGetSubCategoriesQuery, 
  useGetContentTypesQuery,
  useUploadFileMutation 
} from '../../services/rssApi';

const GlobalUpload = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [ingestFile, { isLoading: isUploading }] =  useUploadFileMutation();

  const TYPE_OPTIONS = {
    DOCUMENT: [
      { value: 'PDF', label: t('type_pdf') || 'PDF' },
      { value: 'DOCX', label: t('type_word') || 'Word' },
      { value: 'TXT', label: t('type_text') || 'Text' },
    ],
    MEDIA: [
      { value: 'MP3', label: t('type_audio_mp3') || 'MP3' },
      { value: 'MP4', label: t('type_video_mp4') || 'MP4' },
      { value: 'WAV', label: t('type_audio_wav') || 'WAV' },
    ],
    REPORT: [
      { value: 'JPG', label: t('type_images') || 'Images' },
      { value: 'XLSX', label: t('type_excel') || 'Excel' },
      { value: 'CSV', label: t('type_csv') || 'CSV' },
    ],
  };

  // Selection States
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedSubCatId, setSelectedSubCatId] = useState('');
  const [selectedContentTypeId, setSelectedContentTypeId] = useState('');
  const [year, setYear] = useState('2025');
  const [file, setFile] = useState<File | null>(null);
  const [contentTypeGroup, setContentTypeGroup] = useState('DOCUMENT'); 
  const [fileType, setFileType] = useState('PDF');

  // Queries
  const { data: categories = [] } = useGetCategoriesQuery(i18n.language);
  const { data: subCategories = [] } = useGetSubCategoriesQuery(
    { categoryId: selectedCatId, lang: i18n.language },
    { skip: !selectedCatId }
  );
  const { data: contentTypes = [] } = useGetContentTypesQuery(
    { categoryId: selectedCatId, lang: i18n.language },
    { skip: !selectedCatId }
  );

  // Derived names for metadata
  const currentCatName = categories.find(c => String(c.id) === selectedCatId)?.name || "...";
  const currentSubCatName = subCategories.find(s => String(s.id) === selectedSubCatId)?.name || "...";
  const currentCTName = contentTypes.find(ct => String(ct.id) === selectedContentTypeId)?.name || "...";

  const logicalPath = `/${currentCatName}/${currentSubCatName}/${currentCTName}/${year}/${file ? file.name : t('placeholder_filename')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedContentTypeId) {
      toast.error("Please select a Content Type and a File");
      return;
    }

    const formData = new FormData();
    
    // Core Fields matching your Ingestion CURL
    formData.append('contentTypeId', selectedContentTypeId);
    formData.append('contentYear', year);
    formData.append('type', fileType);

    // Dynamic Metadata JSON string
    const metadata = JSON.stringify({
      category: currentCatName,
      subcategory: currentSubCatName
    });
    formData.append('metadata', metadata);

    // File binary
    formData.append('files', file);

    try {
      await ingestFile(formData).unwrap();
      toast.success(t("UPLOAD_SUCCESS") || "Ingestion Started successfully!");
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.data?.message || "Ingestion failed");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto relative">
      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-4">
          <div className="p-2 bg-orange-100 rounded-lg h-fit">
            <Upload className="text-orange-600" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{t('ingestion_mapping')}</h1>
            <p className="text-xs text-slate-400 font-medium">Map your files to the ingestion engine</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t('category')}</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={selectedCatId}
                onChange={(e) => {
                  setSelectedCatId(e.target.value);
                  setSelectedSubCatId(''); 
                  setSelectedContentTypeId('');
                }}
              >
                <option value="">{t('category_placeholder')}</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t('subcategory')}</label>
            <div className="relative">
              <select 
                disabled={!selectedCatId}
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50 disabled:text-slate-300 transition-all"
                value={selectedSubCatId}
                onChange={(e) => setSelectedSubCatId(e.target.value)}
              >
                <option value="">{t('subcategory_placeholder')}</option>
                {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Content Type - The key ID for ingestion */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t('content_type') || 'Content Type'}</label>
            <div className="relative">
              <select 
                disabled={!selectedCatId}
                className="w-full pl-4 pr-10 py-2.5 bg-white border-2 border-orange-50 rounded-xl text-sm font-bold text-orange-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50 disabled:border-slate-100 transition-all"
                value={selectedContentTypeId}
                onChange={(e) => setSelectedContentTypeId(e.target.value)}
              >
                <option value="">Select Content Type</option>
                {contentTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Data Year */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t('data_year')}</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* File Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t('type')}</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                {TYPE_OPTIONS[contentTypeGroup as keyof typeof TYPE_OPTIONS].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Logical Path (Read Only) */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-slate-700">{t('logical_path')}</label>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t('read_only')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-xs font-mono text-slate-400 truncate flex-1">
                {logicalPath}
              </span>
              <Copy size={14} className="text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
          </div>
        </div>

        {/* File Selection Zone */}
        <div className="border-t border-slate-100 pt-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('file_selection')}</p>
          <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-orange-400 bg-orange-50/20' : 'border-slate-200 hover:border-orange-200'}`}>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-3">
                <FileText className={file ? "text-orange-500" : "text-slate-300"} size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">
                {file ? file.name : t('file_input_placeholder')}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">MAX 50MB (PDF, DOCX, MEDIA)</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-4">
          <button 
            type="submit"
            disabled={isUploading || !file || !selectedContentTypeId}
            className="px-8 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center gap-2"
          >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            {isUploading ? t('ingesting') || 'Ingesting...' : t('btn_validate_queue') || 'Start Ingestion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalUpload;