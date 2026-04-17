import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  AirVent,
  Bath,
  Building2,
  Car,
  Check,
  CookingPot,
  Flame,
  Home,
  MapPin,
  Monitor,
  Star,
  WashingMachine,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import * as listingsApi from "@api/listings.api.js";
import * as reviewsApi from "@api/reviews.api.js";
import { BookingWidget } from "@components/booking/BookingWidget.jsx";
import { EmptyState } from "@components/common/EmptyState.jsx";
import { Spinner } from "@components/common/Spinner.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { formatDistanceKm, listingDisplayTitle, listingLocationLine } from "@utils/format.js";
import { cn } from "@utils/cn.js";

const typeShort = { room: "Room", floor: "Floor", home: "Home", suite: "Suite", farmhouse: "Farmhouse" };

function amenityMeta(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("wifi")) return { Icon: Wifi, label: name };
  if (n.includes("ac") || n.includes("air")) return { Icon: AirVent, label: name };
  if (n.includes("bath")) return { Icon: Bath, label: name };
  if (n.includes("ground")) return { Icon: Building2, label: name };
  if (n.includes("kitchen") || n.includes("cooking")) return { Icon: CookingPot, label: name };
  if (n.includes("park")) return { Icon: Car, label: name };
  if (n.includes("tv")) return { Icon: Monitor, label: name };
  if (n.includes("wash")) return { Icon: WashingMachine, label: name };
  if (n.includes("hot") || n.includes("water")) return { Icon: Flame, label: name };
  return { Icon: Home, label: name };
}

function initials(name) {
  if (!name?.trim()) return "?";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatReviewMonth(iso) {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "MMMM yyyy");
  } catch {
    return "";
  }
}

function StarRow({ value }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("h-3 w-3", i <= value ? "fill-[#eab308] text-[#eab308]" : "text-stone-200")}
          aria-hidden
        />
      ))}
    </span>
  );
}

function PhotoPlaceholder({ type }) {
  const grad =
    type === "floor"
      ? "from-sky-600 to-blue-800"
      : type === "home"
        ? "from-emerald-600 to-green-800"
        : type === "suite"
          ? "from-amber-500 to-orange-700"
          : "from-brand-500 to-brand-800";
  return (
    <div
      className={cn(
        "flex aspect-[16/10] w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br text-white",
        grad
      )}
    >
      <Home className="h-12 w-12 opacity-90" aria-hidden />
      <p className="mt-2 text-[13px] font-medium opacity-90">Photo coming soon</p>
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const eventId = sp.get("eventId") || undefined;
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data: listing, isPending, isError } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsApi.getListingDetail(id).then((r) => r.data),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewsApi.getListingReviews(id).then((r) => r.data),
    enabled: !!id,
  });

  const distribution = useMemo(() => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const k = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
      buckets[k] += 1;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: Math.round((buckets[star] / total) * 100),
      count: buckets[star],
    }));
  }, [reviews]);

  if (isPending) {
    return (
      <PageWrapper className="flex justify-center py-20">
        <Spinner />
      </PageWrapper>
    );
  }
  if (isError || !listing) {
    return (
      <PageWrapper>
        <p className="text-stone-600">Listing not found.</p>
      </PageWrapper>
    );
  }

  const title = listingDisplayTitle(listing);
  const host = listing.hostId;
  const photos = listing.photos || [];
  const typePill = typeShort[listing.type] || listing.type;
  const locLine = listingLocationLine(listing);
  const dist = formatDistanceKm(listing.distanceKm);
  const amenities = listing.amenities || [];
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const shownReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <PageWrapper className="pb-28 lg:pb-10">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Gallery */}
          {photos.length === 0 ? (
            <PhotoPlaceholder type={listing.type} />
          ) : (
            <>
              <div className="hidden gap-1 lg:grid lg:grid-cols-[2fr_1fr] lg:grid-rows-2">
                <button
                  type="button"
                  className="relative row-span-2 block min-h-0 overflow-hidden rounded-l-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  onClick={() => setGalleryOpen(true)}
                >
                  <img
                    src={photos[0]}
                    alt=""
                    className="h-full min-h-[280px] w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                  />
                </button>
                {photos[1] ? (
                  <button
                    type="button"
                    className="relative block min-h-0 overflow-hidden rounded-tr-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    onClick={() => setGalleryOpen(true)}
                  >
                    <img src={photos[1]} alt="" className="h-full min-h-[136px] w-full object-cover" loading="lazy" />
                  </button>
                ) : null}
                {photos[2] ? (
                  <button
                    type="button"
                    className="relative block min-h-0 overflow-hidden rounded-br-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    onClick={() => setGalleryOpen(true)}
                  >
                    <img src={photos[2]} alt="" className="h-full min-h-[136px] w-full object-cover" loading="lazy" />
                    {photos.length > 3 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-stone-900/45 text-sm font-semibold text-white">
                        View all {photos.length} photos
                      </span>
                    ) : null}
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
                {photos.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className="relative w-[85%] shrink-0 snap-center snap-always overflow-hidden rounded-xl"
                    onClick={() => setGalleryOpen(true)}
                  >
                    <img src={src} alt="" className="aspect-[16/10] w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                  </button>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-1.5 lg:hidden">
                {photos.map((src, i) => (
                  <span
                    key={src}
                    className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-brand-500" : "bg-stone-300")}
                    aria-hidden
                  />
                ))}
              </div>
            </>
          )}

          {galleryOpen ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Photos"
            >
              <button type="button" className="absolute right-4 top-4 text-white" onClick={() => setGalleryOpen(false)}>
                Close
              </button>
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {photos.map((src) => (
                    <img key={src} src={src} alt="" className="w-full rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <span className="mt-6 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            {typePill}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">{title}</h1>
          <p className="mt-1 text-[15px] text-stone-500">{locLine}</p>
          <p className="mt-2 text-sm text-stone-600">
            <span className="text-[#eab308]">★</span>{" "}
            <span className="font-medium text-stone-900">{listing.avgRating?.toFixed(1) || "—"}</span> (
            {listing.reviewCount ?? 0} reviews)
            {eventId && dist ? (
              <>
                {" "}
                · <span className="font-medium text-stone-800">{dist}</span> from venue
              </>
            ) : null}
          </p>

          {host ? (
            <div className="mt-6 flex gap-4 rounded-xl border border-stone-200 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700">
                {initials(host.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-stone-900">{host.fullName || "Host"}</p>
                <p className="mt-0.5 text-sm text-stone-600">
                  Trust score: <span className="font-semibold text-stone-800">{host.trustScore ?? "—"}</span>/100
                </p>
                {host.kycStatus === "verified" ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Check className="h-3 w-3" aria-hidden />
                    KYC verified
                  </span>
                ) : null}
                <p className="mt-2 text-[13px] text-stone-400">
                  Responds within 2 hours
                  {host.responseRate != null ? ` · ${Math.round(host.responseRate * 100)}% response rate` : ""}
                </p>
              </div>
            </div>
          ) : null}

          {amenities.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-stone-900">What this place offers</h2>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                {visibleAmenities.map((a) => {
                  const { Icon, label } = amenityMeta(a);
                  return (
                    <div key={a} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0 text-stone-400" aria-hidden />
                      <span className="text-sm capitalize text-stone-700">{label}</span>
                    </div>
                  );
                })}
              </div>
              {amenities.length > 6 ? (
                <button
                  type="button"
                  className="btn-press mt-4 text-sm font-medium text-brand-700 hover:underline"
                  onClick={() => setShowAllAmenities((v) => !v)}
                >
                  {showAllAmenities ? "Show fewer" : `Show all ${amenities.length} amenities`}
                </button>
              ) : null}
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-stone-900">Where you&apos;ll stay</h2>
            <div className="mt-3 h-[160px] overflow-hidden rounded-xl border border-stone-200 bg-stone-100 sm:h-[200px] md:h-[240px]">
              {mapsKey ? (
                <div className="flex h-full items-center justify-center text-sm text-stone-500">
                  <MapPin className="mr-2 h-5 w-5 text-brand-500" aria-hidden />
                  Map preview (enable Static Maps for embed)
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
                  <MapPin className="h-8 w-8" aria-hidden />
                  <p className="text-[13px]">Map view available when connected</p>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-stone-500">{locLine}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-stone-900">Reviews</h2>
            {reviews.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Reviews appear after completed stays."
                />
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-col gap-4 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-start sm:gap-6">
                  <div className="shrink-0">
                    <p className="text-4xl font-bold text-stone-900">{listing.avgRating?.toFixed(1) || "—"}</p>
                    <StarRow value={Math.round(listing.avgRating || 0)} />
                    <p className="mt-1 text-sm text-stone-500">{reviews.length} reviews</p>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    {distribution.map(({ star, pct }) => (
                      <div key={star} className="flex items-center gap-3 text-xs text-stone-600">
                        <span className="w-8 shrink-0">{star} star</span>
                        <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-200">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-stone-400">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ul className="mt-6 space-y-4">
                  {shownReviews.map((r) => (
                    <li key={r._id} className="rounded-xl border border-stone-200 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700">
                            {initials(r.reviewerName || r.guestName || "Guest")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-900">
                              {r.reviewerName || r.guestName || "Guest"}
                            </p>
                            <p className="text-xs text-stone-400">
                              {formatReviewMonth(r.createdAt) || formatReviewMonth(r.date)}
                            </p>
                          </div>
                        </div>
                        <StarRow value={Number(r.rating) || 0} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">{r.comment}</p>
                    </li>
                  ))}
                </ul>
                {reviews.length > 3 ? (
                  <button
                    type="button"
                    className="btn-press mt-4 text-sm font-medium text-brand-700 hover:underline"
                    onClick={() => setShowAllReviews((v) => !v)}
                  >
                    {showAllReviews ? "Show less" : `See all ${reviews.length} reviews`}
                  </button>
                ) : null}
              </>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <BookingWidget listing={listing} eventId={eventId} />
        </div>
      </div>
    </PageWrapper>
  );
}
