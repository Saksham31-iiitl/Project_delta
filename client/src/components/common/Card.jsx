import { cn } from "@utils/cn.js";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-xl border border-stone-200 bg-white", className)} {...props}>
      {children}
    </div>
  );
}
