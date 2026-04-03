const SkeletonBase = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`} />
);

export const StatsCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
    <div className="flex justify-between items-start">
      <div className="space-y-3">
        <SkeletonBase className="h-4 w-24" />

        <SkeletonBase className="h-10 w-16" />
      </div>

      <SkeletonBase className="h-12 w-12 rounded-xl" />
    </div>

    <SkeletonBase className="mt-4 h-4 w-32" />
  </div>
);

export const FileRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-4">
      {/* File Icon placeholder */}
      <SkeletonBase className="h-10 w-10 rounded-lg" />
      <div className="space-y-2">
        {/* Display Name placeholder */}
        <SkeletonBase className="h-4 w-48" />
        {/* Date placeholder */}
        <SkeletonBase className="h-3 w-20" />
      </div>
    </div>
    {/* Arrow placeholder */}
    <SkeletonBase className="h-5 w-5 rounded-full" />
  </div>
);

export const TableSkeleton = ({
  columnCount,
  rowCount = 5,
}: {
  columnCount: number;
  rowCount?: number;
}) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-50">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <td key={colIndex} className="px-10 py-6">
              <SkeletonBase
                className={`h-4 ${
                  colIndex === 0 ? "w-12" : colIndex === 1 ? "w-48" : "w-24"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const DashboardLoadingState = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
      <div className="flex justify-between mb-6">
        <SkeletonBase className="h-6 w-32" />
        <SkeletonBase className="h-10 w-28 rounded-xl" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <FileRowSkeleton key={i} />
      ))}
    </div>
  </div>
);
