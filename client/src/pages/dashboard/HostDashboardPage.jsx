import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import * as bookingsApi from "@api/bookings.api.js";
import * as listingsApi from "@api/listings.api.js";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { formatInr } from "@utils/format.js";

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
    <PageWrapper>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Host dashboard</h1>
        <Link to="/host/listings/new">
          <Button size="sm">New listing</Button>
        </Link>
      </div>
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-stone-700">Your listings</h2>
        {listingsLoading ? <p className="mt-2 text-sm text-stone-500">Loading…</p> : null}
        <ul className="mt-2 space-y-2 text-sm">
          {listings.map((l) => (
            <li key={l._id}>
              <Link to={`/listings/${l._id}`} className="text-brand-600">
                {l.type} · {l.status}
              </Link>
            </li>
          ))}
        </ul>
        {!listingsLoading && listings.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            No listings yet.{" "}
            <Link to="/host/listings/new" className="text-brand-600">
              Create one
            </Link>
          </p>
        ) : null}
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-stone-700">Booking requests</h2>
        {bookingsLoading ? <p className="mt-2 text-sm text-stone-500">Loading…</p> : null}
        <ul className="mt-2 space-y-3">
          {pending.map((b) => (
            <li key={b._id} className="rounded-lg border border-stone-200 p-3 text-sm">
              <p>{formatInr(b.totalAmount)}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="confirm"
                  disabled={confirmMut.isPending}
                  onClick={() => confirmMut.mutate(b._id)}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={declineMut.isPending}
                  onClick={() => declineMut.mutate(b._id)}
                >
                  Decline
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {!bookingsLoading && pending.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No pending requests.</p>
        ) : null}
      </section>
    </PageWrapper>
  );
}
