import { Calendar, Home, Plus, Search, Star, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@utils/cn.js";
import { useAuthStore } from "@stores/authStore.js";

const linkClass = ({ isActive }) =>
  cn(
    "flex min-h-12 min-w-[52px] flex-col items-center justify-end gap-0.5 pb-1 text-[11px] font-medium",
    isActive ? "text-brand-600" : "text-stone-400"
  );

export function MobileNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const onHub = location.pathname.startsWith("/e/");

  if (location.pathname.startsWith("/login")) return null;

  const hubTo = user ? "/organizer" : "/login?redirect=/organizer";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      role="navigation"
      aria-label="Primary mobile"
    >
      <div className="relative mx-auto flex h-14 max-w-lg items-end justify-around px-1 pt-1">
        <NavLink to="/" className={linkClass} aria-current={location.pathname === "/" ? "page" : undefined}>
          <Home className="h-5 w-5" aria-hidden />
          Home
        </NavLink>
        <NavLink to="/search" className={linkClass} aria-current={location.pathname.startsWith("/search") ? "page" : undefined}>
          <Search className="h-5 w-5" aria-hidden />
          Search
        </NavLink>
        <div className="relative flex w-16 flex-col items-center">
          <NavLink
            to={hubTo}
            className="absolute -top-6 flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-brand-900 shadow-md"
            aria-label="Occasion hub"
          >
            {onHub ? <Star className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </NavLink>
          <span className={cn("mt-5 text-[10px] font-medium", onHub || location.pathname.startsWith("/organizer") ? "text-brand-600" : "text-stone-400")}>
            Hub
          </span>
        </div>
        <NavLink
          to="/dashboard"
          className={linkClass}
          aria-current={location.pathname.startsWith("/dashboard") ? "page" : undefined}
        >
          <Calendar className="h-5 w-5" aria-hidden />
          Bookings
        </NavLink>
        <NavLink
          to={user ? "/profile" : "/login"}
          className={linkClass}
          aria-current={location.pathname.startsWith("/profile") ? "page" : undefined}
        >
          <User className="h-5 w-5" aria-hidden />
          Profile
        </NavLink>
      </div>
    </nav>
  );
}
