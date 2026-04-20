import {
  Building2,
  Calendar,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@utils/cn.js";
import { useAuthStore } from "@stores/authStore.js";

function initials(user) {
  const n = user?.fullName?.trim();
  if (n) {
    const parts = n.split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase().slice(0, 2);
  }
  if (user?.email) return user.email[0].toUpperCase();
  if (user?.phone) return user.phone.replace(/\D/g, "").slice(-2) || null;
  return null;
}

export function Navbar({ className }) {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.roles?.includes("admin");
  const isHost = user?.roles?.includes("host");

  const [menuOpen, setMenuOpen] = useState(false);
  const [hostMenuOpen, setHostMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);
  const hostMenuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (hostMenuRef.current && !hostMenuRef.current.contains(e.target)) setHostMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const hostListPath = token ? "/host/listings/new" : "/login?redirect=/host/listings/new";
  const createHubPath = token ? "/organizer/create" : "/login?redirect=/organizer/create";

  const drawerLinkClass = "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors";

  return (
    <header className={cn("sticky top-0 z-40 border-b border-stone-200 bg-white/97 backdrop-blur", className)}>
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-6 lg:px-10">

        {/* Left: hamburger (mobile) + logo + nav */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            className="btn-press rounded-lg p-2 text-stone-600 lg:hidden"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path d="M4 22 L20 6 L36 22 V34 H26 V24 H14 V34 H4 Z" fill="#1a4731"/>
              <circle cx="20" cy="16" r="3" fill="#f5a623"/>
            </svg>
            <span className="font-display text-[22px] text-brand-800 tracking-tight">HostTheGuest</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-7 lg:flex">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                cn(
                  "relative text-[14px] font-medium text-stone-600 hover:text-brand-800 transition-colors",
                  isActive && "text-brand-800"
                )
              }
            >
              {({ isActive }) => (
                <>
                  Stays
                  {isActive && <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-accent-500" />}
                </>
              )}
            </NavLink>

            <NavLink
              to="/organizer"
              className={({ isActive }) =>
                cn("text-[14px] font-medium text-stone-600 hover:text-brand-800 transition-colors", isActive && "text-brand-800")
              }
            >
              Occasion Hubs
            </NavLink>

            {/* For Hosts dropdown */}
            <div className="relative" ref={hostMenuRef}>
              <button
                type="button"
                className="flex items-center gap-1 text-[14px] font-medium text-stone-600 hover:text-brand-800 transition-colors"
                onClick={() => setHostMenuOpen((o) => !o)}
              >
                For Hosts
                <ChevronDown className={cn("h-4 w-4 transition-transform", hostMenuOpen && "rotate-180")} />
              </button>
              {hostMenuOpen && (
                <div className="absolute left-0 mt-3 w-52 rounded-2xl border border-stone-200 bg-white py-1.5 shadow-xl">
                  <p className="px-4 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                    Choose your role
                  </p>
                  <Link
                    to={hostListPath}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-stone-50"
                    onClick={() => setHostMenuOpen(false)}
                  >
                    <Home className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">List your space</p>
                      <p className="text-[11px] text-stone-400">Earn from your spare room</p>
                    </div>
                  </Link>
                  <Link
                    to={createHubPath}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-stone-50"
                    onClick={() => setHostMenuOpen(false)}
                  >
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">Create event hub</p>
                      <p className="text-[11px] text-stone-400">For wedding &amp; pooja organizers</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: auth controls */}
        <div className="flex items-center gap-3">
          {token ? (
            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                type="button"
                className="btn-press flex items-center gap-2 rounded-full border border-stone-200 py-1 pl-1 pr-3 hover:border-stone-300 transition-colors"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                  {initials(user) ?? <User className="h-4 w-4 text-brand-600" />}
                </span>
                <span className="text-[13px] font-medium text-stone-700">{user?.fullName?.split(" ")[0] || "Account"}</span>
                <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", menuOpen && "rotate-180")} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-stone-200 bg-white py-1 shadow-xl" role="menu">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
                    <User className="h-4 w-4 text-stone-400" /> Profile
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
                    <Calendar className="h-4 w-4 text-stone-400" /> My Bookings
                  </Link>
                  {isHost && (
                    <Link to="/host" className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4 text-stone-400" /> Host Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setMenuOpen(false)}>
                      <Shield className="h-4 w-4 text-stone-400" /> Admin
                    </Link>
                  )}
                  <hr className="my-1 border-stone-100" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => { setMenuOpen(false); logout(); navigate("/", { replace: true }); }}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-4 lg:flex">
              <Link to="/login" className="text-[14px] font-medium text-stone-700 hover:text-brand-800 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="rounded-full bg-brand-800 px-5 py-2 text-[13px] font-semibold text-white hover:bg-brand-900 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(85%,300px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4">
              <span className="font-display text-[20px] text-brand-800">HostTheGuest</span>
              <button type="button" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {token && user && (
              <div className="flex items-center gap-3 border-b border-stone-100 bg-stone-50 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                  {initials(user) ?? <User className="h-4 w-4 text-white" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-800">{user.fullName || "Welcome back"}</p>
                  <p className="truncate text-xs text-stone-400">{user.phone || user.email || ""}</p>
                </div>
              </div>
            )}

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
              <NavLink to="/" end className={({ isActive }) => cn(drawerLinkClass, isActive && "bg-brand-50 text-brand-700 font-semibold")} onClick={() => setDrawerOpen(false)}>
                <Home className="h-5 w-5" /> Home
              </NavLink>
              <NavLink to="/search" className={({ isActive }) => cn(drawerLinkClass, isActive && "bg-brand-50 text-brand-700 font-semibold")} onClick={() => setDrawerOpen(false)}>
                <Search className="h-5 w-5" /> Stays
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => cn(drawerLinkClass, isActive && "bg-brand-50 text-brand-700 font-semibold")} onClick={() => setDrawerOpen(false)}>
                <Calendar className="h-5 w-5" /> My Bookings
              </NavLink>

              <div className="my-1.5 border-t border-stone-100" />
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">For Hosts</p>
              <Link to={hostListPath} className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                <Home className="h-5 w-5 text-brand-500" /> List your space
              </Link>
              <Link to={createHubPath} className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                <Building2 className="h-5 w-5 text-brand-500" /> Create event hub
              </Link>

              {token && (isHost || isAdmin) && (
                <>
                  <div className="my-1.5 border-t border-stone-100" />
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Dashboard</p>
                  {isHost && (
                    <Link to="/host" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                      <LayoutDashboard className="h-5 w-5 text-stone-400" /> Host Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                      <Shield className="h-5 w-5 text-stone-400" /> Admin Panel
                    </Link>
                  )}
                </>
              )}

              <div className="my-1.5 border-t border-stone-100" />
              {token ? (
                <>
                  <Link to="/profile" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                    <User className="h-5 w-5 text-stone-400" /> Profile
                  </Link>
                  <button
                    type="button"
                    className={cn(drawerLinkClass, "w-full text-left text-red-500")}
                    onClick={() => { setDrawerOpen(false); logout(); navigate("/", { replace: true }); }}
                  >
                    <LogOut className="h-5 w-5 text-red-400" /> Log out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="mx-3 mt-1 flex items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-900"
                  onClick={() => setDrawerOpen(false)}
                >
                  <User className="h-4 w-4" /> Log in
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
