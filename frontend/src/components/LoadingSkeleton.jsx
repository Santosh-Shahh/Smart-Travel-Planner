const LoadingSkeleton = () => {
  return (
    <div className="w-full">
      {/* Weather Skeleton */}
      <div className="mb-12">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-4"></div>
        <div className="flex gap-4 overflow-x-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[140px] flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm animate-pulse">
              <div className="h-4 w-16 bg-slate-200 rounded mx-auto mb-3"></div>
              <div className="h-10 w-10 bg-slate-200 rounded-full mx-auto mb-3"></div>
              <div className="h-6 w-12 bg-slate-200 rounded mx-auto mb-2"></div>
              <div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary Title Skeleton */}
      <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse mb-8"></div>

      {/* Itinerary Cards Skeleton */}
      {[1, 2].map((day) => (
        <div key={day} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6 animate-pulse">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
            <div className="h-14 w-14 bg-slate-200 rounded-2xl shrink-0"></div>
            <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          </div>

          <div className="space-y-12">
            {[1, 2].map((act) => (
              <div key={act} className="flex justify-end md:justify-normal md:odd:flex-row-reverse">
                <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-3rem)] bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
                    <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-full bg-slate-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                    <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded mt-4 pt-4 border-t border-slate-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
