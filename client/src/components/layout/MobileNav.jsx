import { Calendar, Heart, Home, Search, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@utils/cn.js";
import { useAuthStore } from "@stores/authStore.js";

export function MobileNav() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  if (location.pathname.startsWith("/login")) return null;

  const items = [
    { to: "/",          icon: Home,     label: "Home",   end: true },
    { to: "/search",    icon: Search,   label: "Search"           },
    { to: "/organizer", icon: Heart,    label: "Saved"            },
    { to: "/dashboard", icon: Calendar, label: "Trips"            },
    { to: user ? "/profile" : "/login", icon: User, label: "Me"  },
  ];

  return (
    <nav
      className="fixed bottom-2 left-3 right-3 z-50 lg:hidden"
      role="navigation"
      aria-label="Primary mobile"
    >
      <div
        className="flex items-center justify-around rounded-[24px] bg-white/95 dark:bg-[#0a1a0f]/95 backdrop-blur-md border border-stone-100 dark:border-[#1e3829]"
        style={{
          boxShadow: "0 12px 28px -10px rgba(15,45,30,.25)",
          padding: `10px 8px calc(10px + env(safe-area-inset-bottom))`,
        }}
      >
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={`${to}-${label}`}
            to={to}
            end={end}
            className="flex flex-1 flex-col items-center gap-0.5 py-1"
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn("h-5 w-5 transition-colors", isActive ? "text-brand-800 dark:text-accent-400" : "text-stone-400 dark:text-stone-500")}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-[10px] leading-none font-semibold transition-colors",
                    isActive ? "text-brand-800 dark:text-accent-400" : "text-stone-400 dark:text-stone-500"
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 h-1 w-1 rounded-full transition-all duration-200",
                    isActive ? "bg-accent-500" : "bg-transparent"
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
