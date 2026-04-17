import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as bookingsApi from "@api/bookings.api.js";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { formatInr } from "@utils/format.js";

export default function GuestDashboardPage() {
  const { data: bookings = [], isPending } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingsApi.myBookings().then((r) => r.data),
  });

  return (
    <PageWrapper>
      <h1 className="text-xl font-semibold">Your bookings</h1>
      {isPending ? <p className="mt-4 text-stone-500">Loading…</p> : null}
      <ul className="mt-4 space-y-3">
        {bookings.map((b) => (
          <li key={b._id} className="rounded-lg border border-stone-200 p-3 text-sm">
            <p className="font-medium text-stone-900">{b.status}</p>
            <p className="text-stone-500">
              {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}
            </p>
            <p className="text-stone-600">{formatInr(b.totalAmount)}</p>
            <Link to={`/listings/${b.listingId}`} className="text-brand-600">
              View listing
            </Link>
          </li>
        ))}
      </ul>
      {bookings.length === 0 && !isPending ? <p className="mt-4 text-stone-500">No trips yet.</p> : null}
    </PageWrapper>
  );
}
