
/**
 * Loading skeleton for the dashboard screen
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-8">
      {/* Date Selector Skeleton */}
      <div className="flex justify-between items-center bg-[#1f2d5c]/50 rounded-xl p-3 border border-white/5">
        <div className="h-6 w-24 bg-gray-700 rounded-md" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-700 rounded-lg" />
          <div className="h-8 w-8 bg-gray-700 rounded-lg" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-4 border border-white/5 bg-[#1f2d5c]/50 h-28 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 w-16 bg-gray-700 rounded" />
              <div className="h-8 w-8 bg-gray-700 rounded-full" />
            </div>
            <div className="h-8 w-24 bg-gray-700 rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Health Indicators Skeleton */}
      <div className="bg-[#1f2d5c]/50 rounded-2xl p-5 border border-white/5">
        <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 py-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-700 rounded" />
                <div className="h-6 w-12 bg-gray-700 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gray-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Gauges Skeleton */}
      <div className="bg-[#1f2d5c]/50 rounded-2xl p-5 border border-white/5">
        <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1B2A4A] rounded-xl p-3 h-20">
              <div className="flex justify-between mb-2">
                <div className="h-4 w-20 bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-700 rounded-full" />
              </div>
              <div className="h-2.5 w-full bg-gray-800 rounded-full mb-2" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-700 rounded" />
                <div className="h-3 w-16 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="bg-[#1f2d5c]/50 rounded-2xl p-5 border border-white/5">
        <div className="h-6 w-40 bg-gray-700 rounded mb-6" />
        <div className="h-48 w-48 mx-auto bg-gray-700 rounded-full mb-6" />
        <div className="flex justify-center gap-4 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-700 rounded-full" />
              <div className="h-3 w-16 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
