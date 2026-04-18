import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Calendar, CheckCircle2, ChevronRight, Home, PlusCircle, User, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import * as bookingsApi from "@api/bookings.api.js";
import * as listingsApi from "@api/listings.api.js";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { Spinner } from "@components/common/Spinner.jsx";
import { formatInr } from "@utils/format.js";

const LISTING_STATUS = {
  published: { label: "Published", cls: "bg-green-50 text-green-700 border-green-200" },
  draft:     { label: "Draft",     cls: "bg-stone-50 text-stone-500 border-stone-200" },
  pending:   { label: "In review", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected:  { label: "Rejected",  cls: "bg-red-50 text-red-600 border-red-200" },
};

const LISTING_TYPE_ICON = {
  room:      Home,
  floor:     Building2,
  home:      Home,
  suite:     Building2,
  farmhouse: Home,
};

function ListingStatusBadge({ status }) {
  const s = LISTING_STATUS[status] || { label: status, cls: "bg-stone-50 text-stone-500 border-stone-200" };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${s.cls}`}>
      {s.label}
    </span>
  );
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function HostDashboardPage() {
  const qc = useQueryClient();

  const { data: bookings = [], isPending: bookingsLoading } = useQuery({
    queryKey: ["host-bookings"],
    queryFn: () => bookingsApi.hostBookings().then((r) => r.data),
  });
  const { data: listings = [], isPending: listingsLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => listingsApi.myListings().then((r) => r.data),
  });

  const confirmMut = useMutation({
    mutationFn: (id) => bookingsApi.confirmBooking(id).then((r) => r.data),
    onSuccess: () => {
      toast.success("Booking confirmed");
      qc.invalidateQueries({ queryKey: ["host-bookings"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const declineMut = useMutation({
    mutationFn: (id) => bookingsApi.declineBooking(id).then((r) => r.data),
    onSuccess: () => {
      toast.message("Booking declined");
      qc.invalidateQueries({ queryKey: ["host-bookings"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const pending = bookings.filter((b) => b.status === "pending");

  return (
    <PageWrapper className="max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Host Dashboard
            {pending.length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                {pending.length}
              </span>
            )}
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">Manage your listings and booking requests</p>
        </div>
        <Link to="/host/listings/new">
          <Button variant="secondary" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New listing
          </Button>
        </Link>
      </div>

      {/* Booking Requests */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Booking requests
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              {pending.length} pending
            </span>
          )}
        </h2>

        {bookingsLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {!bookingsLoading && pending.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center">
            <p className="text-sm text-stone-400">No pending booking requests</p>
          </div>
        )}

        {!bookingsLoading && pending.length > 0 && (
          <motion.ul
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          >
            {pending.map((b) => (
              <motion.li
                key={b._id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/40"
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Guest icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-stone-200">
                    <User className="h-4 w-4 text-stone-500" />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">
                        {b.guestName || b.guestId?.fullName || "Guest"}
                      </span>
                      <span className="text-[11px] text-stone-400">{b._id?.slice(-6).toUpperCase()}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-stone-500">
                      <Calendar className="mr-1 inline h-3.5 w-3.5 text-stone-400" />
                      {fmt(b.checkIn)} – {fmt(b.checkOut)} · {b.guestsCount || 1} guest{(b.guestsCount || 1) > 1 ? "s" : ""}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-stone-900">{formatInr(b.totalAmount)}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 border-t border-amber-200 bg-white px-4 py-3">
                  <Button
                    size="sm"
                    className="flex flex-1 items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    disabled={confirmMut.isPending || declineMut.isPending}
                    onClick={() => confirmMut.mutate(b._id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex flex-1 items-center justify-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    disabled={confirmMut.isPending || declineMut.isPending}
                    onClick={() => declineMut.mutate(b._id)}
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>

      {/* Listings */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Your listings</h2>

        {listingsLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {!listingsLoading && listings.length === 0 && (
          <motion.div
            className="flex flex-col items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-12 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
              <Home className="h-8 w-8 text-brand-400" />
            </div>
            <h3 className="text-base font-semibold text-stone-900">No listings yet</h3>
            <p className="mt-1 max-w-xs text-sm text-stone-500">
              List your spare room or property to start earning from nearby events.
            </p>
            <Link to="/host/listings/new" className="mt-5">
              <Button variant="accent">Create your first listing →</Button>
            </Link>
          </motion.div>
        )}

        {!listingsLoading && listings.length > 0 && (
          <motion.ul
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          >
            {listings.map((l) => {
              const Icon = LISTING_TYPE_ICON[l.type] || Home;
              return (
                <motion.li
                  key={l._id}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
                >
                  <Link to={`/listings/${l._id}`} className="flex items-center gap-4 p-4">
                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                      <Icon className="h-5 w-5 text-brand-600" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ListingStatusBadge status={l.status} />
                        <span className="text-xs capitalize text-stone-400">{l.type}</span>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-stone-900">
                        {l.title || (l.type ? l.type.charAt(0).toUpperCase() + l.type.slice(1) : "Listing")}
                      </p>
                      {l.pricePerNight ? (
                        <p className="mt-0.5 text-[13px] text-stone-500">
                          {formatInr(l.pricePerNight)}/night · {l.maxGuests || 1} guest{(l.maxGuests || 1) > 1 ? "s" : ""} max
                        </p>
                      ) : null}
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </section>
    </PageWrapper>
  );
}
