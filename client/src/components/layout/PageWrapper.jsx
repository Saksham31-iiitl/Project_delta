import { cn } from "@utils/cn.js";

export function PageWrapper({ children, className }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 pb-20 pt-4 sm:px-5 sm:pt-5 lg:px-8 lg:pb-8", className)}>{children}</div>;
}
