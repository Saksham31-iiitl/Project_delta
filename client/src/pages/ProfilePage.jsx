import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  Plus,
  Star,
  User,
  X,
} from "lucide-react";
import * as usersApi from "@api/users.api.js";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { Spinner } from "@components/common/Spinner.jsx";
import { useAuthStore } from "@stores/authStore.js";
import { sanitizeAuthUser } from "@utils/authUser.js";

/* ── helpers ─────────────────────────────────────────── */
function initials(user) {
  const n = user?.fullName?.trim();
  if (n) {
    const parts = n.split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || ""))
      .toUpperCase()
      .slice(0, 2);
  }
  if (user?.email) return user.email[0].toUpperCase();
  if (user?.phone) return user.phone.replace(/\D/g, "").slice(-2) || null;
  return null;
}

function RolePill({ role }) {
  const map = {
    host:      { label: "Host",      cls: "bg-brand-50 text-brand-700" },
    organizer: { label: "Organizer", cls: "bg-accent-500/10 text-accent-600" },
    admin:     { label: "Admin",     cls: "bg-purple-50 text-purple-700" },
    guest:     { label: "Guest",     cls: "bg-stone-100 text-stone-600" },
  };
  const { label, cls } = map[role] || map.guest;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${cls}`}>
      {label}
    </span>
  );
}

/* ── Logout confirmation dialog ──────────────────────── */
function LogoutDialog({ open, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          {/* Dialog */}
          <motion.div
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <LogOut className="h-5 w-5 text-red-500" />
              </div>
              <button onClick={onCancel} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-base font-semibold text-stone-900">Log out?</h3>
            <p className="mt-1 text-sm text-stone-500">
              You'll need to verify your phone again to log back in.
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={onConfirm}>
                Yes, log out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Quick action link ───────────────────────────────── */
function QuickLink({ icon: Icon, label, desc, to, accent = false }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3.5 transition-all hover:border-brand-200 hover:bg-brand-50 hover:shadow-sm"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ? "bg-accent-500" : "bg-brand-50"}`}>
        <Icon className={`h-4 w-4 ${accent ? "text-brand-900" : "text-brand-600"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-stone-900">{label}</p>
        {desc && <p className="text-xs text-stone-500">{desc}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
    </Link>
  );
}


/* ── Component ───────────────────────────────────────── */
export default function ProfilePage() {
  const mergeUser  = useAuthStore((s) => s.mergeUser);
  const logout     = useAuthStore((s) => s.logout);
  const cached     = useAuthStore((s) => s.user);
  const navigate   = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => usersApi.getMe().then((r) => r.data),
  });

  useEffect(() => {
    if (data) mergeUser(sanitizeAuthUser(data));
  }, [data, mergeUser]);

  const user   = data ? sanitizeAuthUser(data) : cached;
  const roles  = user?.roles || ["guest"];
  const isHost = roles.includes("host");
  const isOrg  = roles.includes("organizer");
  const isAdmin= roles.includes("admin");

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <PageWrapper className="max-w-lg">
      <LogoutDialog
        open={showLogout}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />

      {isPending && !cached ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : isError ? (
        <p className="mt-4 text-sm text-red-600">Could not load profile.</p>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ── Profile card ────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {/* Green header strip */}
            <div className="h-20 bg-gradient-to-r from-brand-800 to-brand-600" />

            <div className="px-5 pb-5">
              {/* Avatar — overlaps the strip */}
              <div className="-mt-10 mb-3 flex items-end justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-brand-700 text-2xl font-bold text-white shadow-md">
                  {initials(user) ?? <User className="h-8 w-8 text-white/80" />}
                </div>
                <div className="flex gap-2">
                  {roles.map((r) => <RolePill key={r} role={r} />)}
                </div>
              </div>

              {/* Name */}
              {user?.fullName ? (
                <h1 className="text-xl font-bold text-stone-900">{user.fullName}</h1>
              ) : (
                <p className="text-sm text-stone-400 italic">No name set</p>
              )}

              {/* Email + phone */}
              <div className="mt-2 space-y-1">
                {user?.email && (
                  <div className="flex items-center gap-1.5 text-sm text-stone-500">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {user.email}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-stone-500">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {user?.phone || <span className="italic text-stone-400">No phone added</span>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick actions ────────────────────────────── */}
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
              Quick actions
            </p>

            <QuickLink
              icon={Calendar}
              label="My Bookings"
              desc="View all your trips"
              to="/dashboard"
            />

            {isHost && (
              <QuickLink
                icon={LayoutDashboard}
                label="Host Dashboard"
                desc="Manage listings & requests"
                to="/host"
              />
            )}

            {isOrg && (
              <QuickLink
                icon={Star}
                label="Occasion Hubs"
                desc="Manage your event hubs"
                to="/organizer"
              />
            )}

            {isAdmin && (
              <QuickLink
                icon={CheckCircle2}
                label="Admin Panel"
                desc="Review pending listings"
                to="/admin"
              />
            )}

            <QuickLink
              icon={Plus}
              label="List Your Space"
              desc="Earn from your spare room"
              to="/host/listings/new"
              accent
            />

            <QuickLink
              icon={Home}
              label="Find Stays"
              desc="Browse nearby accommodations"
              to="/search"
            />
          </div>

          {/* ── Log out ──────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </motion.div>
      )}
    </PageWrapper>
  );
}
