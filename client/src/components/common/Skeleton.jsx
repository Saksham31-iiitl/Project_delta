import { cn } from "@utils/cn.js";

export function Skeleton({ className, ...props }) {
  return <div className={cn("rounded-md bg-stone-200 skeleton-shimmer", className)} {...props} />;
}
