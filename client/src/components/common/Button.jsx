import { cn } from "@utils/cn.js";

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }) {
  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed",
    accent:
      "bg-accent-500 text-brand-900 font-semibold hover:bg-accent-600 disabled:opacity-60 disabled:cursor-not-allowed",
    secondary: "border border-stone-300 bg-transparent text-stone-900 hover:bg-stone-50",
    ghost: "text-stone-600 hover:bg-stone-50",
    danger: "border border-red-500 text-red-500 hover:bg-red-50",
    confirm: "border border-green-600 text-green-600 hover:bg-green-50",
  };
  const sizes = {
    sm: "min-h-9 px-3.5 py-1.5 text-xs",
    md: "min-h-11 px-6 py-2.5 text-sm font-medium",
    lg: "min-h-12 px-8 py-3.5 text-base font-medium",
  };
  return (
    <button
      type={type}
      className={cn(
        "btn-press inline-flex items-center justify-center rounded-lg transition-[transform,background-color,border-color] duration-100 ease-out",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
