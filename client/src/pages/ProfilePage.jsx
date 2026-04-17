import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  LayoutDashboard,
  LogOut,
  Phone,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
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
  const p = user?.phone?.replace(/\D/g, "") || "";
  return p.slice(-2) || "?";
}

function KycBadge({ status }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <ShieldCheck className="h-3.5 w-3.5" /> KYC Verified
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" /> KYC Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
      <ShieldAlert className="h-3.5 w-3.5" /> KYC Not Verified
    </span>
  );
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

/* ── Trust score bar ─────────────────────────────────── */
function TrustBar({ score }) {
  const pct = Math.min(100, Math.max(0, (score / 100) * 100));
  const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      />
    </div>
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

      {isPending && !cached?.phone ? (
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
                  {initials(user)}
                </div>
                <div className="flex gap-2">
                  {roles.map((r) => <RolePill key={r} role={r} />)}
                </div>
              </div>

              {/* Name + phone */}
              {user?.fullName && (
                <h1 className="text-xl font-bold text-stone-900">{user.fullName}</h1>
              )}
              <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                <Phone className="h-3.5 w-3.5" />
                {user?.phone || "—"}
              </div>

              {/* KYC badge */}
              <div className="mt-3">
                <KycBadge status={user?.kycStatus} />
              </div>

              {/* KYC nudge banner */}
              {user?.kycStatus !== "verified" && (
                <motion.div
                  className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Complete your KYC</p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Aadhaar verification unlocks bookings and hosting.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Trust score */}
              {user?.trustScore != null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-accent-500" /> Trust score
                    </span>
                    <span className="font-semibold text-stone-700">{user.trustScore} / 100</span>
                  </div>
                  <TrustBar score={user.trustScore} />
                </div>
              )}
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
