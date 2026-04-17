import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import * as eventsApi from "@api/events.api.js";
import { ListingCard } from "@components/listings/ListingCard.jsx";
import { ListingCardSkeleton } from "@components/common/ListingCardSkeleton.jsx";
import { HubBanner } from "@components/hub/HubBanner.jsx";
import { formatCompactInr, formatDistanceKm } from "@utils/format.js";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

export default function OccasionHubPage() {
  const { code } = useParams();

  const { data, isPending, isError } = useQuery({
    queryKey: ["hub-listings", code],
    queryFn: () => eventsApi.getHubListings(code).then((r) => r.data),
    enabled: !!code,
  });

  useEffect(() => {
    const fromWa = sessionStorage.getItem("ns_wa_hub") === code;
    if (fromWa && data?.event) {
      toast.message(`Welcome to ${data.event.eventName}`);
      sessionStorage.removeItem("ns_wa_hub");
    }
  }, [code, data?.event]);

  if (isPending) {
    return (
      <div>
        <div className="h-40 animate-pulse bg-brand-800/80" />
        <PageWrapper>
          <ListingCardSkeleton horizontal />
        </PageWrapper>
      </div>
    );
  }

  if (isError || !data?.event) {
    return (
      <PageWrapper>
        <p className="text-stone-600">This Occasion Hub could not be found.</p>
      </PageWrapper>
    );
  }

  const { event, listings } = data;
  const closest = listings.length ? Math.min(...listings.map((l) => l.distanceKm ?? 99)) : null;
  const minPrice = listings.length ? Math.min(...listings.map((l) => l.pricePerNight)) : null;

  return (
    <div>
      <HubBanner
        event={event}
        shareUrl={`${window.location.origin}/e/${code}`}
        onShare={() =>
          navigator.clipboard.writeText(`${window.location.origin}/e/${code}`).then(() => toast.success("Link copied"))
        }
      />
      <div className="grid grid-cols-3 border-b border-stone-200 bg-white py-3 text-center text-xs text-stone-500">
        <div>
          <p className="text-base font-bold text-brand-700">{listings.length}</p>
          <p>Stays nearby</p>
        </div>
        <div className="border-x border-stone-200">
          <p className="text-base font-bold text-brand-700">{closest != null ? formatDistanceKm(closest) : "—"}</p>
          <p>Closest</p>
        </div>
        <div>
          <p className="text-base font-bold text-brand-700">{minPrice != null ? `₹${formatCompactInr(minPrice)}` : "—"}</p>
          <p>From / night</p>
        </div>
      </div>
      <PageWrapper>
        <h2 className="mt-2 text-lg font-semibold text-stone-900">Verified stays near the venue</h2>
        <div className="mt-4 flex flex-col gap-3">
          {listings.map((l) => (
            <ListingCard
              key={l._id}
              listing={l}
              variant="horizontal"
              hubName={event.eventName}
              eventId={event._id}
            />
          ))}
        </div>
      </PageWrapper>
    </div>
  );
}
