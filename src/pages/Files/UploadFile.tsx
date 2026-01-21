import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Upload, ChevronDown, 
  FileText, Copy, Check, Loader2, X 
} from 'lucide-react';
import { 
  useGetCategoriesQuery, 
  useGetSubCategoriesQuery, 
  useUploadFileMutation 
} from '../../services/rssApi';

const GlobalUpload = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  // Define dynamic options with translation keys for labels
  const TYPE_OPTIONS = {
    DOCUMENT: [
      { value: 'PDF', label: t('type_pdf') },
      { value: 'DOCX', label: t('type_word') },
      { value: 'TXT', label: t('type_text') },
    ],
    MEDIA: [
      { value: 'MP3', label: t('type_audio_mp3') },
      { value: 'MP4', label: t('type_video_mp4') },
      { value: 'WAV', label: t('type_audio_wav') },
    ],
    REPORT: [
      { value: 'JPG', label: t('type_images') },
      { value: 'XLSX', label: t('type_excel') },
      { value: 'CSV', label: t('type_csv') },
    ],
  };

  // Form State
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedSubCatId, setSelectedSubCatId] = useState('');
  const [year, setYear] = useState('2025');
  const [file, setFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState('DOCUMENT'); 
  const [fileType, setFileType] = useState('PDF');

  // Fetch Data
  const { data: categories = [] } = useGetCategoriesQuery(i18n.language);
  const { data: subCategories = [] } = useGetSubCategoriesQuery(
    { categoryId: selectedCatId, lang: i18n.language },
    { skip: !selectedCatId }
  );

  // Auto-calculate Logical Path
  const logicalPath = `/Documents/${fileType}/${year}/${file ? file.name : t('placeholder_filename')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return; // Only file is strictly required for global upload

    const formData = new FormData();
    formData.append('file', file);
    if (selectedCatId) formData.append('category_id', selectedCatId);
    if (selectedSubCatId) formData.append('sub_category_id', selectedSubCatId);
    formData.append('year', year);
    formData.append('type', fileType);

    try {
      await uploadFile(formData).unwrap();
      navigate(-1);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto relative">
      {/* Header with Close Option */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-4">
          <div className="p-2 bg-orange-100 rounded-lg h-fit">
            <Upload className="text-orange-600" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{t('ingestion_mapping')}</h1>
            <p className="text-xs text-slate-400 font-medium italic">{t('global_upload_desc')}</p>
          </div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          title={t('close')}
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Category Dropdown (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t('category')}</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={selectedCatId}
                onChange={(e) => {
                  setSelectedCatId(e.target.value);
                  setSelectedSubCatId(''); 
                }}
              >
                <option value="">{t('category_placeholder')}</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          {/* SubCategory Dropdown (Optional) */}
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
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          {/* Content Type Dropdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-slate-700">{t('content_type')}</label>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('system_taxonomy')}</span>
            </div>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none"
                value={contentType}
                onChange={(e) => {
                  const newGroup = e.target.value;
                  setContentType(newGroup);
                  setFileType(TYPE_OPTIONS[newGroup as keyof typeof TYPE_OPTIONS][0].value);
                }}
              >
                <option value="DOCUMENT">{t('option_document')}</option>
                <option value="MEDIA">{t('option_media')}</option>
                <option value="REPORT">{t('option_report')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Type Dropdown (Filtered) */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-slate-700">{t('type')}</label>
              <span className="text-[10px] text-orange-500 font-black uppercase tracking-tighter italic">
                {t('driven_by')} {t(`option_${contentType.toLowerCase()}`)}
              </span>
            </div>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                {TYPE_OPTIONS[contentType as keyof typeof TYPE_OPTIONS].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Data Year Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t('data_year')}</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          {/* Logical Path */}
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

        {/* File Selection Area */}
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
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{t('max_size_label')}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-4">
          <button 
            type="submit"
            disabled={isUploading || !file}
            className="px-8 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:bg-slate-300 transition-all flex items-center gap-2"
          >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            {t('btn_validate_queue')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GlobalUpload;