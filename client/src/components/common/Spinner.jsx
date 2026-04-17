import { cn } from "@utils/cn.js";

export function Spinner({ className }) {
  return (
    <div
      className={cn("h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent", className)}
      role="status"
      aria-label="Loading"
    />
  );
}
