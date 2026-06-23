
/**
 * Loading skeleton for the expense list
 */
export default function ExpenseListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse pb-24">
      {/* Banner Skeleton */}
      <div className="bg-[#1f2d5c]/50 rounded-2xl p-5 border border-white/5 h-36">
        <div className="flex justify-between mb-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-700 rounded" />
            <div className="h-8 w-32 bg-gray-700 rounded" />
          </div>
          <div className="space-y-2 flex flex-col items-end">
            <div className="h-6 w-20 bg-gray-700 rounded-lg" />
            <div className="h-4 w-16 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-gray-700 rounded-full mb-2" />
        <div className="flex justify-between">
          <div className="h-3 w-8 bg-gray-700 rounded" />
          <div className="h-3 w-20 bg-gray-700 rounded" />
          <div className="h-3 w-8 bg-gray-700 rounded" />
        </div>
      </div>

      {/* Controls Skeleton */}
      <div className="flex gap-2">
        <div className="h-10 flex-grow bg-[#1f2d5c]/50 rounded-xl" />
        <div className="h-10 w-10 bg-[#1f2d5c]/50 rounded-xl" />
      </div>

      {/* Rows Skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-[#1f2d5c]/50 border border-white/5 rounded-xl h-20">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center border-r border-white/10 pr-3 space-y-1">
                <div className="h-3 w-8 bg-gray-700 rounded" />
                <div className="h-5 w-6 bg-gray-700 rounded" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 bg-gray-700 rounded" />
                <div className="flex gap-2">
                  <div className="h-4 w-16 bg-gray-700 rounded" />
                  <div className="h-4 w-16 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
            <div className="h-5 w-20 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
