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
  const [ingestFile, { isLoading: isUploading }] = useUploadFileMutation();

  // Selection States
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedSubCatId, setSelectedSubCatId] = useState('');
  const [selectedContentTypeId, setSelectedContentTypeId] = useState('');
  const [year, setYear] = useState('');
  const [files, setFiles] = useState<File[]>([]); 

  // Queries
  const { data: categories = [] } = useGetCategoriesQuery(i18n.language);
  
  const { data: subCategories = [] } = useGetSubCategoriesQuery(
    { categoryId: selectedCatId, lang: i18n.language },
    { skip: !selectedCatId }
  );

  const { data: contentTypes = [] } = useGetContentTypesQuery(
    { lang: i18n.language }
  );

  // Validation Logic: Checks if all required fields are present
  const isSubCatRequired = selectedCatId && subCategories.length > 0;
  const isFormValid = 
    selectedContentTypeId && 
    selectedCatId && 
    (!isSubCatRequired || selectedSubCatId) && 
    year.trim() !== '' && 
    files.length > 0;

  // Derived names
  const currentCatName = categories.find(c => String(c.id) === selectedCatId)?.name || "...";
  const currentSubCatName = subCategories.find(s => String(s.id) === selectedSubCatId)?.name || "...";
  const currentCTName = contentTypes.find(ct => String(ct.id) === selectedContentTypeId)?.name || "...";

  const logicalPath = `/${currentCatName}/${currentSubCatName}/${currentCTName}/${year || 'YYYY'}/${files.length > 0 ? `${files.length} files` : t('placeholder_filename')}`;

  const getFileType = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase();
    const imageExts = ['JPG', 'JPEG', 'PNG', 'WEBP'];
    if (imageExts.includes(ext!)) return 'IMAGE';
    if (ext === 'PDF') return 'PDF';
    if (['DOC', 'DOCX'].includes(ext!)) return 'WORD';
    if (ext === 'TXT') return 'TEXT';
    if (ext === 'CSV') return 'CSV';
    if (['XLS', 'XLSX'].includes(ext!)) return 'EXCEL';
    return 'OTHER';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 10) {
      toast.error("You can only upload a maximum of 10 files at once");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict multi-layer check
    if (!isFormValid) {
      toast.error("Please fill in all required fields (marked with *)");
      return;
    }

    const formData = new FormData();
    formData.append('contentTypeId', selectedContentTypeId);
    formData.append('contentYear', year);
    formData.append('type', getFileType(files[0]));

    const metadata = JSON.stringify({
      category: currentCatName,
      subcategory: currentSubCatName,
    });
    formData.append('metadata', metadata);
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await ingestFile(formData).unwrap();
      toast.success(t("UPLOAD_SUCCESSFUL") || "Ingestion Started successfully!");
      navigate(-1);
    } catch (err: any) {
      toast.error(t("invalid_file_type") || "Upload failed: Check file types");
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
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">

          {/* Content Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {t('content_type')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                className={`w-full pl-4 pr-10 py-2.5 bg-white border-2 rounded-xl text-sm font-bold appearance-none outline-none transition-all ${selectedContentTypeId ? 'border-orange-50' : 'border-slate-200'}`}
                value={selectedContentTypeId}
                onChange={(e) => setSelectedContentTypeId(e.target.value)}
                required
              >
                <option value="">Select Content Type</option>
                {contentTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" size={16} />
            </div>
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {t('category')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={selectedCatId}
                onChange={(e) => {
                  setSelectedCatId(e.target.value);
                  setSelectedSubCatId(''); 
                }}
                required
              >
                <option value="">{t('category_placeholder')}</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Subcategory */}
          {selectedCatId && subCategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                {t('subcategory')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 appearance-none focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={selectedSubCatId}
                  onChange={(e) => setSelectedSubCatId(e.target.value)}
                  required
                >
                  <option value="">{t('subcategory_placeholder')}</option>
                  {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          )}

          {/* Data Year */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {t('data_year')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                required
              />
            </div>
          </div>

          {/* Logical Path (Read Only) */}
          <div className="space-y-2 col-span-2">
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
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('file_selection')} <span className="text-red-500">*</span></p>
          <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${files.length > 0 ? 'border-orange-400 bg-orange-50/20' : 'border-slate-200 hover:border-orange-200'}`}>
            <input 
              type="file" 
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              required
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-3">
                <FileText className={files.length > 0 ? "text-orange-500" : "text-slate-300"} size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">
                {files.length > 0 ? `${files.length} files selected` : t('file_input_placeholder')}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">MAX 10 FILES - 50MB PER FILE</p>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-slate-600 truncate max-w-[150px]">{f.name}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, index) => index !== i))}>
                    <X size={12} className="text-red-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-4">
          <button 
            type="submit"
            disabled={isUploading || !isFormValid}
            className="px-8 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center gap-2"
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