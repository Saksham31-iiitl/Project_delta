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
  Footprints,
  Heart,
  Home,
  KeyRound,
  MapPin,
  Monitor,
  Share2,
  ShieldCheck,
  Star,
  WashingMachine,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { addRecentlyViewed } from "@utils/recentlyViewed.js";
import { isWishlisted, toggleWishlist } from "@utils/wishlist.js";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import * as listingsApi from "@api/listings.api.js";
import * as reviewsApi from "@api/reviews.api.js";
import { BookingWidget } from "@components/booking/BookingWidget.jsx";
import { useAuthStore } from "@stores/authStore.js";
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
  return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function formatReviewMonth(iso) {
  if (!iso) return "";
  try { return format(parseISO(iso), "MMMM yyyy"); } catch { return ""; }
}

const MAP_OPTIONS = { disableDefaultUI: true, zoomControl: true, clickableIcons: false };

export default function ListingDetailPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const eventId = sp.get("eventId") || undefined;
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "nearbystay-map",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

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

  useEffect(() => {
    if (listing) {
      addRecentlyViewed(listing);
      setLiked(isWishlisted(listing._id));
    }
  }, [listing?._id]);

  const distribution = useMemo(() => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const k = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
      buckets[k] += 1;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({ star, pct: Math.round((buckets[star] / total) * 100) }));
  }, [reviews]);

  if (isPending) {
    return <PageWrapper className="flex justify-center py-20"><Spinner /></PageWrapper>;
  }
  if (isError || !listing) {
    return <PageWrapper><p className="text-stone-600">Listing not found.</p></PageWrapper>;
  }

  const title = listingDisplayTitle(listing);
  const host = listing.hostId;
  const photos = listing.photos || [];
  const typePill = typeShort[listing.type] || listing.type;
  const locLine = listingLocationLine(listing);
  const dist = formatDistanceKm(listing.distanceKm);
  const amenities = listing.amenities || [];
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);
  const shownReviews = showAllReviews ? reviews : reviews.slice(0, 4);
  const coords = listing?.location?.coordinates;
  const listingLat = coords?.[1];
  const listingLng = coords?.[0];
  const hasCoords = listingLat != null && listingLng != null;
  const kyc = host?.kycStatus === "verified";

  const isOwnListing =
    currentUser && listing &&
    String(currentUser._id) === String(listing.hostId?._id ?? listing.hostId);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWishlist = () => {
    setLiked(toggleWishlist(listing));
  };

  const bookingRef = useRef(null);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-cream">
      {/* Mobile sticky book-now bar */}
      {!isOwnListing && (
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-stone-200 px-5 py-3 flex items-center justify-between lg:hidden shadow-[0_-4px_20px_-8px_rgba(15,45,30,.15)]">
          <div>
            <p className="font-mono text-[16px] font-semibold text-brand-900 leading-none">
              {listing.pricePerNight != null ? `₹${listing.pricePerNight.toLocaleString("en-IN")}` : "—"}
              <span className="text-[11px] text-stone-400 font-sans font-normal"> /night</span>
            </p>
            <p className="text-[10px] text-brand-700 font-semibold mt-0.5">Tap Reserve to book</p>
          </div>
          <button
            type="button"
            onClick={scrollToBooking}
            className="rounded-full bg-brand-800 text-white font-semibold px-6 py-3 text-[13px] active:scale-95 transition-transform"
          >
            Reserve
          </button>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pb-32 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-16">

        {/* Breadcrumbs (desktop only) */}
        <p className="hidden lg:block mb-4 text-[12px] text-stone-500">
          <Link to="/search" className="hover:text-brand-700">Search</Link>
          {locLine && <><span className="mx-1.5">·</span><span>{locLine}</span></>}
          <span className="mx-1.5">·</span>
          <span className="font-medium text-brand-700">{title}</span>
        </p>

        {/* Headline row */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                {typePill}
              </span>
              {kyc && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                  <ShieldCheck className="h-3 w-3" /> KYC verified host
                </span>
              )}
            </div>
            <h1 className="font-display text-[28px] leading-[1.05] text-brand-900 sm:text-[36px] lg:text-[44px]">
              {title}
              {listing.type && (
                <em className="text-accent-600"> — {typePill.toLowerCase()} floor</em>
              )}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-stone-600">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-[#eab308]" />
                <span className="font-semibold text-stone-900">{listing.avgRating?.toFixed(1) || "—"}</span>
                · {listing.reviewCount ?? 0} reviews
              </span>
              <span className="text-stone-300">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-brand-600" />
                {locLine}
                {dist && <span className="font-semibold text-brand-700">{" "}· {dist}</span>}
              </span>
              {listing.maxGuests && <><span className="text-stone-300">·</span><span>Sleeps {listing.maxGuests}</span></>}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-[13px] font-medium text-stone-700 hover:border-stone-300 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                liked ? "border-red-200 bg-red-50 text-red-600" : "border-stone-200 text-stone-700 hover:border-stone-300"
              )}
            >
              <Heart className={cn("h-4 w-4", liked ? "fill-red-500 text-red-500" : "")} />
              {liked ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Gallery */}
        {photos.length === 0 ? (
          <div className="hidden lg:flex aspect-[16/7] w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-white">
            <Home className="h-14 w-14 text-brand-300" />
            <p className="mt-2 text-sm text-brand-400">Photo coming soon</p>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop asymmetric gallery */}
            <div
              className="hidden gap-2 overflow-hidden rounded-2xl lg:grid"
              style={{ gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(2,180px)" }}
            >
              {photos.slice(0, 5).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={cn(
                    "block overflow-hidden focus:outline-none",
                    i === 0 && "col-span-2 row-span-2"
                  )}
                  onClick={() => setGalleryOpen(true)}
                >
                  <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading={i === 0 ? "eager" : "lazy"} />
                </button>
              ))}
            </div>

            {/* Mobile: full-bleed hero with overlaid controls */}
            <div className="lg:hidden -mx-4 -mt-4 relative">
              <div className="relative h-[300px] sm:h-[360px] overflow-hidden">
                <img
                  src={photos[0]}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                {/* Controls */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Link
                    to="/search"
                    className="w-10 h-10 rounded-full bg-white/95 grid place-items-center shadow"
                  >
                    <X className="h-4 w-4 text-stone-700" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleShare} className="w-10 h-10 rounded-full bg-white/95 grid place-items-center shadow">
                      <Share2 className="h-4 w-4 text-stone-700" />
                    </button>
                    <button type="button" onClick={handleWishlist} className="w-10 h-10 rounded-full bg-white/95 grid place-items-center shadow">
                      <Heart className={cn("h-4 w-4", liked ? "fill-red-500 text-red-500" : "text-stone-700")} />
                    </button>
                  </div>
                </div>
                {/* Photo counter */}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 text-white px-3 py-1 text-[11px] font-medium">
                  1 / {photos.length}
                </div>
                {kyc && (
                  <span className="absolute bottom-4 left-4 gold-seal rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    Verified
                  </span>
                )}
              </div>
              {/* Horizontal thumbnail strip */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto chip-scroll px-4 py-3 bg-white">
                  {photos.slice(1).map((src, i) => (
                    <button key={src} type="button" onClick={() => setGalleryOpen(true)} className="shrink-0 h-14 w-20 overflow-hidden rounded-xl">
                      <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Show all photos button */}
            {photos.length > 1 && (
              <div className="absolute bottom-3 right-4 z-10 hidden lg:block">
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-[13px] font-semibold shadow hover:bg-stone-50"
                >
                  Show all {photos.length} photos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lightbox */}
        {galleryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/85 p-4" role="dialog" aria-modal="true">
            <button type="button" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30" onClick={() => setGalleryOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {photos.map((src) => (
                  <img key={src} src={src} alt="" className="w-full rounded-xl object-cover" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content grid */}
        <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_400px]">
          <div>

            {/* Host row */}
            {host && (
              <div className="flex items-center justify-between border-b border-stone-200 pb-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 font-display text-[20px] text-white">
                    {initials(host.fullName)}
                    {kyc && (
                      <span className="gold-seal absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-brand-900">
                      Hosted by {host.fullName || "Host"}
                    </p>
                    <p className="text-[13px] text-stone-500">
                      Responds within 2 hours
                      {host.responseRate != null && ` · ${Math.round(host.responseRate * 100)}% response rate`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Key features strip */}
            <div className="grid gap-5 border-b border-stone-200 py-8 sm:grid-cols-3">
              {dist && (
                <div className="flex gap-3">
                  <Footprints className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                  <div>
                    <p className="text-[14px] font-semibold text-brand-900">{dist} from venue</p>
                    <p className="mt-0.5 text-[12px] text-stone-500">Easy walking distance</p>
                  </div>
                </div>
              )}
              {kyc && (
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                  <div>
                    <p className="text-[14px] font-semibold text-brand-900">Aadhaar-verified host</p>
                    <p className="mt-0.5 text-[12px] text-stone-500">Government-ID checked</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                <div>
                  <p className="text-[14px] font-semibold text-brand-900">Private space</p>
                  <p className="mt-0.5 text-[12px] text-stone-500">Your own entrance &amp; keys</p>
                </div>
              </div>
            </div>

            {/* About */}
            {listing.description && (
              <div className="border-b border-stone-200 py-8">
                <h2 className="font-display text-[26px] text-brand-900 mb-3">About this stay</h2>
                <p className="text-[15px] leading-relaxed text-stone-700">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="border-b border-stone-200 py-8">
                <h2 className="font-display text-[26px] text-brand-900 mb-5">What's here</h2>
                <div className="grid gap-4 sm:grid-cols-2 text-[14px] text-stone-700">
                  {visibleAmenities.map((a) => {
                    const { Icon, label } = amenityMeta(a);
                    return (
                      <div key={a} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-stone-400" />
                        <span className="capitalize">{label}</span>
                      </div>
                    );
                  })}
                </div>
                {amenities.length > 6 && (
                  <button
                    type="button"
                    className="mt-5 rounded-full border border-brand-700 px-5 py-2 text-[13px] font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
                    onClick={() => setShowAllAmenities((v) => !v)}
                  >
                    {showAllAmenities ? "Show fewer" : `Show all ${amenities.length} amenities`}
                  </button>
                )}
              </div>
            )}

            {/* Map */}
            <div className="border-b border-stone-200 py-8">
              <h2 className="font-display text-[26px] text-brand-900 mb-4">Where you'll stay</h2>
              <div className="h-[220px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:h-[260px]">
                {mapsLoaded && hasCoords ? (
                  <GoogleMap
                    mapContainerClassName="h-full w-full"
                    center={{ lat: listingLat, lng: listingLng }}
                    zoom={15}
                    options={MAP_OPTIONS}
                  >
                    <Marker
                      position={{ lat: listingLat, lng: listingLng }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 11,
                        fillColor: "#1b6b47",
                        fillOpacity: 1,
                        strokeWeight: 2.5,
                        strokeColor: "#fff",
                      }}
                    />
                  </GoogleMap>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
                    <MapPin className="h-8 w-8" />
                    <p className="text-[13px]">Map unavailable</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[13px] text-stone-500">{locLine}</p>
            </div>

            {/* Reviews */}
            <div className="py-8">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-display text-[28px] text-brand-900">
                  <span className="text-[#eab308]">★</span>{" "}
                  {listing.avgRating?.toFixed(1) || "—"} · {reviews.length} reviews
                </h2>
                {reviews.length > 4 && (
                  <button
                    type="button"
                    className="text-[13px] font-semibold text-brand-700 underline underline-offset-4 decoration-accent-500"
                    onClick={() => setShowAllReviews((v) => !v)}
                  >
                    {showAllReviews ? "Show fewer" : "Read all"}
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <EmptyState icon={Star} title="No reviews yet" description="Reviews appear after completed stays." />
              ) : (
                <>
                  {/* Rating distribution */}
                  <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-stone-200 p-5 sm:flex-row sm:items-start sm:gap-8">
                    <div className="shrink-0">
                      <p className="font-display text-[48px] leading-none text-brand-900">{listing.avgRating?.toFixed(1) || "—"}</p>
                      <p className="mt-1 text-[13px] text-stone-500">{reviews.length} reviews</p>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 pt-1">
                      {distribution.map(({ star, pct }) => (
                        <div key={star} className="flex items-center gap-3 text-[12px] text-stone-500">
                          <span className="w-8 shrink-0">{star} ★</span>
                          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-200">
                            <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 shrink-0 text-right">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review cards — editorial blockquote style */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {shownReviews.map((r) => (
                      <figure key={r._id} className="rounded-2xl border border-stone-200 bg-white p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[12px] font-semibold text-stone-700">
                            {initials(r.reviewerName || r.guestName || "Guest")}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-stone-900">
                              {r.reviewerName || r.guestName || "Guest"}
                            </p>
                            <p className="text-[12px] text-stone-400">
                              {formatReviewMonth(r.createdAt) || formatReviewMonth(r.date)}
                            </p>
                          </div>
                          <div className="ml-auto flex items-center gap-0.5">
                            {[1,2,3,4,5].map((i) => (
                              <Star key={i} className={cn("h-3 w-3", i <= Number(r.rating) ? "fill-[#eab308] text-[#eab308]" : "text-stone-200")} />
                            ))}
                          </div>
                        </div>
                        <blockquote className={`font-display italic text-[16px] leading-snug text-stone-800 before:mr-1 before:font-display before:text-[28px] before:text-accent-500 before:content-['"']`}>
                          {r.comment}
                        </blockquote>
                      </figure>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Booking widget */}
          <div ref={bookingRef}>
            {isOwnListing ? (
              <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6 text-center lg:sticky lg:top-24">
                <Home className="mx-auto mb-2 h-8 w-8 text-brand-400" />
                <p className="font-semibold text-brand-800">This is your listing</p>
                <p className="mt-1 text-sm text-brand-600">Guests will see the booking widget here.</p>
              </div>
            ) : (
              <div className="lg:sticky lg:top-24">
                <BookingWidget listing={listing} eventId={eventId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
