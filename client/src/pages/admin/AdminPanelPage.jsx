import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Home,
  Search,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import * as adminApi from "@api/admin.api.js";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { Spinner } from "@components/common/Spinner.jsx";

/* ── Stat card ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-900">{value ?? "—"}</p>
        <p className="text-xs text-stone-500">{label}</p>
      </div>
    </div>
  );
}

/* ── Tab button ────────────────────────────────────────── */
function Tab({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "text-stone-600 hover:bg-stone-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge > 0 && (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/25 text-white" : "bg-red-100 text-red-600"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Overview tab ──────────────────────────────────────── */
function OverviewTab({ analytics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard icon={Users}         label="Total Users"     value={analytics?.users}         color="bg-brand-600" />
      <StatCard icon={Home}          label="Active Listings" value={analytics?.activeListings} color="bg-teal-500" />
      <StatCard icon={ClipboardList} label="Total Bookings"  value={analytics?.bookings}       color="bg-accent-500" />
    </div>
  );
}

/* ── Listings tab ──────────────────────────────────────── */
function ListingsTab() {
  const qc = useQueryClient();

  const { data: pending = [], isPending } = useQuery({
    queryKey: ["admin-pending-listings"],
    queryFn: () => adminApi.pendingListings().then((r) => r.data),
  });

  const approveMut = useMutation({
    mutationFn: (id) => adminApi.approveListing(id).then((r) => r.data),
    onSuccess: () => { toast.success("Listing approved"); qc.invalidateQueries({ queryKey: ["admin-pending-listings"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const rejectMut = useMutation({
    mutationFn: (id) => adminApi.rejectListing(id).then((r) => r.data),
    onSuccess: () => { toast.message("Listing rejected"); qc.invalidateQueries({ queryKey: ["admin-pending-listings"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  if (isPending) return <div className="flex justify-center py-16"><Spinner /></div>;

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
        <Home className="mb-3 h-10 w-10 text-stone-300" />
        <p className="font-medium text-stone-600">No pending listings</p>
        <p className="mt-1 text-sm text-stone-400">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((l) => (
        <motion.div
          key={l._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <Home className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold capitalize text-stone-900">{l.title || l.type || "Listing"}</p>
              <p className="text-xs text-stone-500 capitalize">{l.type} · {l.address?.city || ""}</p>
              {l.pricePerNight && (
                <p className="text-xs text-stone-400">₹{l.pricePerNight}/night</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={approveMut.isPending}
              onClick={() => approveMut.mutate(l._id)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={rejectMut.isPending}
              onClick={() => rejectMut.mutate(l._id)}
              className="flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Shared role config ────────────────────────────────── */
const ROLES = ["guest", "host", "organizer", "admin"];

const ROLE_BADGE = {
  guest:     "bg-stone-100 text-stone-500",
  host:      "bg-brand-50 text-brand-700",
  organizer: "bg-amber-50 text-amber-700",
  admin:     "bg-purple-50 text-purple-700",
};

const ROLE_STYLE = {
  guest:     "bg-stone-100 text-stone-600 border-stone-200",
  host:      "bg-brand-50 text-brand-700 border-brand-200",
  organizer: "bg-amber-50 text-amber-700 border-amber-200",
  admin:     "bg-purple-50 text-purple-700 border-purple-200",
};

const ROLE_ACTIVE = {
  guest:     "bg-stone-500 text-white border-stone-500",
  host:      "bg-brand-600 text-white border-brand-600",
  organizer: "bg-amber-500 text-white border-amber-500",
  admin:     "bg-purple-600 text-white border-purple-600",
};

/* ── Inline role editor (shared by list + search) ──────── */
function RoleEditor({ user, onSaved }) {
  const [localRoles, setLocalRoles] = useState(user.roles);
  const rolesMut = useMutation({
    mutationFn: ({ id, roles }) => adminApi.setUserRoles(id, roles).then((r) => r.data),
    onSuccess: (updated) => {
      toast.success("Roles updated");
      setLocalRoles(updated.roles);
      onSaved?.(updated);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update roles"),
  });

  const toggle = (role) => {
    if (role === "guest") return;
    setLocalRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const isDirty =
    JSON.stringify([...localRoles].sort()) !== JSON.stringify([...user.roles].sort());

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
        Roles
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ROLES.map((role) => {
          const active = localRoles.includes(role);
          const isGuest = role === "guest";
          return (
            <button
              key={role}
              type="button"
              disabled={isGuest}
              onClick={() => toggle(role)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                active ? ROLE_ACTIVE[role] : ROLE_STYLE[role]
              } ${isGuest ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {role}
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <Button
          size="sm"
          disabled={!isDirty || rolesMut.isPending}
          onClick={() => rolesMut.mutate({ id: user._id, roles: localRoles })}
          className="flex items-center gap-1"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {rolesMut.isPending ? "Saving…" : "Save"}
        </Button>
        {isDirty && (
          <button
            type="button"
            className="text-xs text-stone-400 hover:text-stone-600"
            onClick={() => setLocalRoles(user.roles)}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Single user card ──────────────────────────────────── */
function UserCard({ user, defaultOpen = false, onSaved }) {
  const [open, setOpen] = useState(defaultOpen);
  const initials = user.email?.[0]?.toUpperCase() || "?";
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-stone-200 bg-white overflow-hidden"
    >
      {/* Header row — always visible */}
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-stone-900">
            {user.fullName || "No name yet"}
          </p>
          <p className="truncate text-xs text-stone-500">{user.email}</p>
        </div>
        {/* Role badges */}
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {user.roles.filter((r) => r !== "guest").map((r) => (
            <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${ROLE_BADGE[r]}`}>
              {r}
            </span>
          ))}
          {user.hasListing && (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
              {user.listingCount} listing{user.listingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <span className="ml-2 text-xs text-stone-400">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-stone-100 bg-stone-50 px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-stone-500">
            {user.phone && <span>📞 {user.phone}</span>}
            <span>Joined {joinDate}</span>
            <span>{user.listingCount} listing{user.listingCount !== 1 ? "s" : ""} submitted</span>
          </div>
          <RoleEditor user={user} onSaved={onSaved} />
        </div>
      )}
    </motion.div>
  );
}

/* ── Users tab ─────────────────────────────────────────── */
const FILTER_TABS = [
  { key: "all",       label: "All Users" },
  { key: "listings",  label: "Submitted Listing" },
  { key: "hosts",     label: "Hosts" },
  { key: "admins",    label: "Admins" },
];

function UsersTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: allUsers = [], isPending } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => adminApi.getAllUsers().then((r) => r.data),
  });

  const handleSaved = (updated) => {
    qc.setQueryData(["admin-all-users"], (prev = []) =>
      prev.map((u) => (u._id === updated._id ? { ...u, roles: updated.roles } : u))
    );
  };

  /* filter + search */
  const visible = allUsers.filter((u) => {
    const matchesFilter =
      filter === "all"      ? true :
      filter === "listings" ? u.hasListing :
      filter === "hosts"    ? u.roles.includes("host") :
      filter === "admins"   ? u.roles.includes("admin") : true;

    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      u.email?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.phone?.includes(q);

    return matchesFilter && matchesSearch;
  });

  const countFor = (key) =>
    key === "all"      ? allUsers.length :
    key === "listings" ? allUsers.filter((u) => u.hasListing).length :
    key === "hosts"    ? allUsers.filter((u) => u.roles.includes("host")).length :
    key === "admins"   ? allUsers.filter((u) => u.roles.includes("admin")).length : 0;

  return (
    <div className="space-y-4">

      {/* Summary stat row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FILTER_TABS.map(({ key, label }) => {
          const count = countFor(key);
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-2xl border p-3 text-left transition-all ${
                active
                  ? "border-brand-400 bg-brand-600 text-white shadow-sm"
                  : "border-stone-200 bg-white hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              <p className={`text-2xl font-bold ${active ? "text-white" : "text-stone-900"}`}>
                {isPending ? "—" : count}
              </p>
              <p className={`mt-0.5 text-xs font-medium ${active ? "text-brand-100" : "text-stone-500"}`}>
                {label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search within list */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, email or phone…"
          className="w-full rounded-xl border border-stone-200 py-2.5 pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* List */}
      {isPending && (
        <div className="flex justify-center py-14">
          <Spinner />
        </div>
      )}

      {!isPending && visible.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-14 text-center">
          <UserCog className="mb-3 h-10 w-10 text-stone-300" />
          <p className="font-medium text-stone-600">No users match this filter</p>
        </div>
      )}

      {!isPending && (
        <div className="space-y-2">
          {visible.map((u) => (
            <UserCard
              key={u._id}
              user={u}
              defaultOpen={visible.length === 1}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default function AdminPanelPage() {
  const [tab, setTab] = useState("listings");

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.adminAnalytics().then((r) => r.data),
    retry: false,
  });

  const { data: pendingListings = [] } = useQuery({
    queryKey: ["admin-pending-listings"],
    queryFn: () => adminApi.pendingListings().then((r) => r.data),
  });

  return (
    <PageWrapper className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Admin Panel</h1>
        <p className="mt-0.5 text-sm text-stone-500">Approve listings, manage user roles, and view platform stats</p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-1.5">
        <Tab active={tab === "overview"} onClick={() => setTab("overview")} icon={BarChart3}     label="Overview" />
        <Tab active={tab === "listings"} onClick={() => setTab("listings")} icon={ClipboardList} label="Listing Approvals" badge={pendingListings.length} />
        <Tab active={tab === "users"}    onClick={() => setTab("users")}    icon={UserCog}       label="Manage Users" />
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab analytics={analytics} />}
      {tab === "listings" && <ListingsTab />}
      {tab === "users"    && <UsersTab />}
    </PageWrapper>
  );
}
