import { useMemo } from "react";
import {
  FileText,
  Image as ImageIcon,
  BarChart3,
  FolderOpen,
  ArrowRight,
  Loader2,
  Plus,
} from "lucide-react"; 
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGetAllFilesQuery } from "../../services/rssApi";
import { format } from "date-fns";
import type { StatsCardProps } from "../../types";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: files = [], isLoading } = useGetAllFilesQuery();
  console.log(files);

   const getFileIcon = (fileName: string) => {
    const ext = fileName?.split(".").pop()?.toUpperCase() || "";
    const reportExtensions = ["CSV", "XLS", "XLSX"];
    const imageExtensions = ["JPG", "JPEG", "PNG", "WEBP", "SVG"];

    if (reportExtensions.includes(ext)) {
      return <BarChart3 size={24} />;
    } else if (imageExtensions.includes(ext)) {
      return <ImageIcon size={24} />;
    }
    return <FileText size={24} />;
  };

  const stats = useMemo(() => {
    const mediaCount = files.filter((f) => {
      const extension = f.fileName?.split(".").pop()?.toUpperCase();
      const imageExtensions = ["JPG", "JPEG", "PNG", "WEBP"];

      return (
        imageExtensions.includes(extension || "") ||
        ["IMAGE", "MEDIA"].includes(f.type?.toUpperCase()) ||
        f.mimeType?.startsWith("image/")
      );
    }).length;

    const reportsCount = files.filter((f) => {
      const ext = f.fileName?.split(".").pop()?.toUpperCase() || "";
      const reportExtensions = ["CSV", "XLS", "XLSX"];
      return reportExtensions.includes(ext);
    }).length;
   
    
    const totalDocs = files.length - mediaCount - reportsCount;

    const recentFiles = [...files]
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )
      .slice(0, 5);

    return { totalDocs, mediaCount, recentFiles ,reportsCount};
  }, [files]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-rose-800 tracking-tight">
            {t("overview")}
          </h2>
          <p className="text-gray-500 mt-1">{t("welcome_admin")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label={t("total_documents")}
          value={isLoading ? "..." : stats.totalDocs}
          icon={<FileText size={24} />}
          subText={t("stats_subtext")}
          color="text-saffron-600"
          onClick={() => navigate("/results?type=docs")}
        />
        <StatsCard
          label={t("total_media")}
          value={isLoading ? "..." : stats.mediaCount}
          icon={<ImageIcon size={24} />}
          subText={t("stats_subtext")}
          color="text-saffron-600"
          onClick={() => navigate("/results?type=media")}
        />
        <StatsCard
          label={t("active_reports")}
          value={isLoading ? "..." : stats.reportsCount}
          icon={<BarChart3 size={24} />}
          trendColor="text-gray-400 bg-gray-50"
          subText={t("no_change")}
          color="text-saffron-600"
          onClick={() => navigate("/results?type=reports")}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 text-lg">
            {t("recently_added")}
          </h3>

          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-5 py-2.5 bg-saffron-600 text-white font-bold rounded-xl shadow-lg hover:bg-saffron-700 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            {t("upload_file") || "Add Ingestion"}
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-saffron-500" size={32} />
          </div>
        ) : stats.recentFiles.length > 0 ? (
          <div className="space-y-4">
            {stats.recentFiles.map((file) => {
              const catId = file.categoryId;
              const contentId = file.contentTypeId;

              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`/category/${catId}/content-type/${contentId}`)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-saffron-600">
                     {getFileIcon(file.fileName)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm  hover:text-orange-600">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.uploadedAt
                          ? format(new Date(file.uploadedAt), "MMM dd, yyyy")
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 text-gray-300">
                    <ArrowRight size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <FolderOpen size={32} className="text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-semibold mb-1">
              {t("no_files_title")}
            </h4>
            <p className="text-gray-500 text-sm max-w-sm text-center mb-4">
              {t("no_files_desc")}
            </p>
            <button
              onClick={() => navigate(`/upload`)}
              className="flex items-center gap-2 text-saffron-600 font-semibold text-sm hover:text-saffron-700 cursor-pointer"
            >
              {t("browse_cta")} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCard = ({
  label,
  value,
  icon,
  subText,
  color,
  onClick,
}: StatsCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start cursor-pointer" onClick={onClick}>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h2 className="text-4xl font-bold text-gray-900">{value}</h2>
      </div>
      <div className={`p-3 bg-saffron-50 rounded-xl ${color}`}>{icon}</div>
    </div>
    <div className="mt-4 flex items-center text-sm gap-2">
      <span className="text-gray-400">{subText}</span>
    </div>
  </div>
);

export default Dashboard;
