import { Calendar, Home, Plus, Search, Star, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@utils/cn.js";
import { useAuthStore } from "@stores/authStore.js";

export function MobileNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const onHub = location.pathname.startsWith("/e/");

  if (location.pathname.startsWith("/login")) return null;

  const hubTo = user ? "/organizer" : "/login?redirect=/organizer";

  const Item = ({ to, icon: Icon, label, end }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-colors min-w-[52px]",
          isActive ? "text-brand-700" : "text-stone-400"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-xl transition-colors",
            isActive ? "bg-brand-50" : ""
          )}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <span className={cn("text-[10px] font-semibold", isActive ? "text-brand-700" : "text-stone-400")}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      role="navigation"
      aria-label="Primary mobile"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        <Item to="/" icon={Home} label="Home" end />
        <Item to="/search" icon={Search} label="Explore" />

        {/* Centre FAB — Hub */}
        <div className="flex flex-col items-center gap-1">
          <NavLink
            to={hubTo}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500 text-brand-900 shadow-lg shadow-accent-500/30 active:scale-95 transition-transform"
            aria-label="Occasion hub"
          >
            {onHub ? <Star className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
          </NavLink>
          <span className="text-[10px] font-semibold text-stone-400">Hub</span>
        </div>

        <Item to="/dashboard" icon={Calendar} label="Bookings" />
        <Item to={user ? "/profile" : "/login"} icon={User} label="Me" />
      </div>
    </nav>
  );
}
