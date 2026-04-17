export function ListingCardSkeleton({ horizontal }) {
  if (horizontal) {
    return (
      <div className="listing-card flex gap-0 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="skeleton-shimmer h-20 w-[100px] shrink-0 rounded-l-xl rounded-r-none" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-3 pl-3 pr-3">
          <div className="skeleton-shimmer h-4 w-[85%] max-w-[220px] rounded-md" />
          <div className="skeleton-shimmer h-3 w-[55%] max-w-[160px] rounded-md" />
          <div className="skeleton-shimmer h-3 w-[40%] max-w-[100px] rounded-md" />
          <div className="mt-2 flex items-center justify-between">
            <div className="skeleton-shimmer h-5 w-24 rounded-md" />
            <div className="skeleton-shimmer h-4 w-16 rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="skeleton-shimmer aspect-[16/10] w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton-shimmer h-4 w-4/5 rounded-md" />
        <div className="skeleton-shimmer h-3 w-3/5 rounded-md" />
        <div className="skeleton-shimmer h-3 w-full rounded-md" />
      </div>
      <div className="flex justify-between border-t border-stone-200 px-3 py-2">
        <div className="skeleton-shimmer h-5 w-28 rounded-md" />
        <div className="skeleton-shimmer h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}
