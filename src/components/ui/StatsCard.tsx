import type { StatsCardProps } from "../../types";

export const StatsCard = ({
  label,
  value,
  icon,
  subText,
  color,
  onClick,
}: StatsCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:-translate-y-1 transition-all duration-300">
    <div
      className="flex justify-between items-start cursor-pointer"
      onClick={onClick}
    >
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
