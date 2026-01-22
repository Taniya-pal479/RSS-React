import React from 'react';
import { FileText, Image as ImageIcon, BarChart3, FolderOpen, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate=useNavigate()
  

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Text */}
      <div>
         <h2 className="text-3xl font-bold text-rose-800 tracking-tight">{t("overview")}</h2>
         {/* Using welcome_admin or welcome key from your JSON */}
         <p className="text-gray-500 mt-1">{t("welcome_admin")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
            label={t("total_documents")} 
            value="128" 
            icon={<FileText size={24} />} 
            trend="12%" 
            subText={t("stats_subtext")}
            color="text-saffron-600" 
        />
        <StatsCard 
            label={t("total_media")} 
            value="56" 
            icon={<ImageIcon size={24} />} 
            trend="4%" 
            subText={t("stats_subtext")}
            color="text-saffron-600" 
        />
        <StatsCard 
            label={t("active_reports")} 
            value="23" 
            icon={<BarChart3 size={24} />} 
            trend="0%" 
            trendColor="text-gray-400 bg-gray-50"
            subText={t("no_change")}
            color="text-saffron-600" 
        />
      </div>

      {/* Recent Files Empty State */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">{t("recently_added")}</h3>
            <button className="text-sm text-saffron-600 hover:underline">{t("view_all")}</button>
        </div>

        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4"  onClick={() => navigate(`/upload`)}>
                <FolderOpen size={32} className="text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-semibold mb-1">{t("no_files_title")}</h4>
            <p className="text-gray-500 text-sm max-w-sm text-center mb-4">{t("no_files_desc")}</p>
            
            <button  onClick={() => navigate(`/upload`)} className="flex items-center gap-2 text-saffron-600 font-semibold text-sm hover:text-saffron-700">
                {t("browse_cta")} <ArrowRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatsCard = ({ label, value, icon, trend, subText, color, trendColor }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h2 className="text-4xl font-bold text-gray-900">{value}</h2>
        </div>
        <div className={`p-3 bg-saffron-50 rounded-xl ${color}`}>{icon}</div>
    </div>
    <div className="mt-4 flex items-center text-sm gap-2">
        <span className={`px-2 py-0.5 rounded-full font-medium ${trendColor || 'bg-green-50 text-green-700'}`}>
            {trend === "0%" ? "" : "↑"} {trend}
        </span>
        <span className="text-gray-400">{subText}</span>
    </div>
  </div>
);

export default Dashboard;