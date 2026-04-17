import { cn } from "@utils/cn.js";

export function Input({ className, id, label, error, ...props }) {
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={cn(
          "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
          error && "border-red-500",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
