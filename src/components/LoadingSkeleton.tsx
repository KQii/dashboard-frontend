export function LoadingSkeleton() {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

export function ChartLoadingSkeleton() {
  return (
    <div className="border rounded-lg p-6 shadow-sm bg-white animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-100 rounded"></div>
    </div>
  );
}
