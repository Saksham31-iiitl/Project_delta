import { Link } from "react-router-dom";
import { cn } from "@utils/cn.js";
import { Button } from "./Button.jsx";

const linkBtn =
  "btn-press mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600";

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction, className }) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-12 text-center", className)}>
      {Icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <Icon className="h-8 w-8" aria-hidden />
        </div>
      ) : null}
      <h3 className="mt-4 text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">{description}</p>
      {actionLabel && actionHref ? (
        <Link to={actionHref} className={linkBtn}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <Button type="button" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
