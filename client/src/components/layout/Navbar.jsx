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
  ShieldCheck,
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
    return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase().slice(0, 2);
  }
  const p = user?.phone?.replace(/\D/g, "") || "";
  return p.slice(-2) || "?";
}

export function Navbar({ className }) {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.roles?.includes("admin");
  const isHost = user?.roles?.includes("host");
  const kycStatus = user?.kycStatus || "none";

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

  const drawerLinkClass = "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100";

  return (
    <header className={cn("sticky top-0 z-40 border-b border-brand-200 bg-white/95 backdrop-blur", className)}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 lg:h-16 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="btn-press rounded-lg p-2 text-stone-600 lg:hidden"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="font-display truncate text-lg lg:text-xl">
            <span className="text-brand-800 font-bold">HostTheGuest</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-brand-600",
                isActive && "text-brand-600"
              )
            }
          >
            Search
          </NavLink>
          <div className="relative ml-1" ref={hostMenuRef}>
            <button
              type="button"
              className="btn-press flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:border-brand-500 hover:text-brand-600"
              onClick={() => setHostMenuOpen((o) => !o)}
            >
              Become a Host
              <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", hostMenuOpen && "rotate-180")} />
            </button>
            {hostMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg">
                <p className="px-4 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
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
                    <p className="text-[11px] text-stone-400">For wedding & pooja organizers</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {token ? (
            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                type="button"
                className="btn-press flex items-center gap-2 rounded-full border border-stone-200 py-1 pl-1 pr-2 hover:border-stone-300"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                  {initials(user)}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-stone-500 transition-transform", menuOpen && "rotate-180")} />
              </button>
              {menuOpen ? (
                <div
                  className="absolute right-0 mt-2 w-52 min-w-[180px] rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
                  role="menu"
                >
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-stone-400" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4 text-stone-400" />
                    My Bookings
                  </Link>
                  {!isAdmin && (
                    <Link
                      to="/dashboard"
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-stone-400" />
                        KYC Verification
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        kycStatus === "verified" ? "bg-green-100 text-green-700" :
                        kycStatus === "pending" ? "bg-amber-100 text-amber-700" :
                        kycStatus === "rejected" ? "bg-red-100 text-red-600" :
                        "bg-stone-100 text-stone-500"
                      }`}>
                        {kycStatus === "verified" ? "Verified" :
                         kycStatus === "pending" ? "Pending" :
                         kycStatus === "rejected" ? "Rejected" : "Not done"}
                      </span>
                    </Link>
                  )}
                  {isHost ? (
                    <Link
                      to="/host"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-stone-400" />
                      Host Dashboard
                    </Link>
                  ) : null}
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-stone-400" />
                      Admin
                    </Link>
                  ) : null}
                  <hr className="my-1 border-stone-100" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate("/", { replace: true });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 lg:inline-flex"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <span className="font-display text-lg">Menu</span>
              <button type="button" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 p-3">
              <NavLink to="/" end className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                <Home className="h-5 w-5 text-stone-400" />
                Home
              </NavLink>
              <NavLink to="/search" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                <Search className="h-5 w-5 text-stone-400" />
                Search
              </NavLink>
              <div className="mt-1 rounded-lg border border-stone-100 bg-stone-50 p-2">
                <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">Become a Host</p>
                <Link to={hostListPath} className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                  <Home className="h-5 w-5 text-brand-500" />
                  List your space
                </Link>
                <Link to={createHubPath} className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                  <Building2 className="h-5 w-5 text-brand-500" />
                  Create event hub
                </Link>
              </div>
              {token ? (
                <>
                  <Link to="/profile" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/dashboard" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                    My Bookings
                  </Link>
                  {!isAdmin && (
                    <Link to="/dashboard" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                      <ShieldCheck className="h-5 w-5 text-stone-400" />
                      KYC Verification
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        kycStatus === "verified" ? "bg-green-100 text-green-700" :
                        kycStatus === "pending" ? "bg-amber-100 text-amber-700" :
                        kycStatus === "rejected" ? "bg-red-100 text-red-600" :
                        "bg-stone-100 text-stone-500"
                      }`}>
                        {kycStatus === "verified" ? "Verified" : kycStatus === "pending" ? "Pending" : kycStatus === "rejected" ? "Rejected" : "Not done"}
                      </span>
                    </Link>
                  )}
                  {isHost ? (
                    <Link to="/host" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                      Host Dashboard
                    </Link>
                  ) : null}
                  {isAdmin ? (
                    <Link to="/admin" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                      Admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className={cn(drawerLinkClass, "w-full text-left text-red-600")}
                    onClick={() => {
                      setDrawerOpen(false);
                      logout();
                      navigate("/", { replace: true });
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" className={drawerLinkClass} onClick={() => setDrawerOpen(false)}>
                  Log in
                </Link>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
