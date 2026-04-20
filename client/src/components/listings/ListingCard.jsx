import { useState } from "react";
import { Bath, Building2, Car, CookingPot, Flame, Heart, Home, Monitor, Wind, Wifi, WashingMachine, MapPin, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "@utils/cn.js";
import { formatDistanceKm, formatPricePerNight, listingDisplayTitle, listingLocationLine } from "@utils/format.js";
import { isWishlisted, toggleWishlist } from "@utils/wishlist.js";

const typeShort = { room: "Room", floor: "Floor", home: "Home", suite: "Suite", farmhouse: "Farmhouse" };

function amenityIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("wifi")) return Wifi;
  if (n.includes("ac") || n.includes("air")) return Wind;
  if (n.includes("bath")) return Bath;
  if (n.includes("ground")) return Building2;
  if (n.includes("kitchen") || n.includes("cooking")) return CookingPot;
  if (n.includes("park")) return Car;
  if (n.includes("tv") || n.includes("television")) return Monitor;
  if (n.includes("wash")) return WashingMachine;
  if (n.includes("hot") || n.includes("water")) return Flame;
  return Home;
}

export function ListingCard({ listing, variant = "grid", hubName, eventId, className }) {
  if (!listing?._id) return null;
  const title = listingDisplayTitle(listing);
  const locLine = listingLocationLine(listing);
  const dist = formatDistanceKm(listing.distanceKm);
  const kyc = listing.hostId?.kycStatus === "verified" || listing.hostKycVerified;
  const typePill = typeShort[listing.type] || listing.type;
  const allAmenities = listing.amenities || [];
  const amenities = allAmenities.slice(0, 3);
  const extraAm = allAmenities.length - amenities.length;
  const photo = listing.photos?.[0];
  const detailTo = eventId
    ? `/listings/${listing._id}?eventId=${encodeURIComponent(eventId)}`
    : `/listings/${listing._id}`;

  const [liked, setLiked] = useState(() => isWishlisted(listing._id));

  const onToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(toggleWishlist(listing));
  };

  /* ── Grid variant ─────────────────────────────────────── */
  if (variant === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Link
          to={detailTo}
          className={cn(
            "group block overflow-hidden rounded-[18px] border border-stone-200 bg-white transition-all duration-250",
            "hover:-translate-y-[3px] hover:border-brand-200 hover:shadow-[0_22px_50px_-24px_rgba(15,45,30,.28)]",
            className
          )}
        >
          {/* Photo */}
          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
            {photo ? (
              <img src={photo} alt={`Photo of ${title}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
            ) : (
              <Home className="absolute inset-0 m-auto h-14 w-14 text-brand-300" aria-hidden />
            )}
            {hubName && (
              <span className="absolute bottom-2 left-2 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                {hubName}
              </span>
            )}
            <button
              type="button"
              onClick={onToggleLike}
              className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow backdrop-blur-sm transition-colors hover:bg-white"
              aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Heart className={cn("h-4 w-4 transition-colors", liked ? "fill-red-500 text-red-500" : "fill-transparent text-stone-500")} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                  {typePill}
                </span>
                <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900">{title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] text-stone-500">
                  <MapPin className="h-3 w-3 shrink-0 text-stone-400" />
                  {locLine}
                  {dist && <><span className="text-stone-300">·</span><span className="font-medium text-brand-700">{dist}</span></>}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {kyc && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  <ShieldCheck className="h-3 w-3" /> KYC verified
                </span>
              )}
              {listing.womenSafe && (
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">Women safe</span>
              )}
              {listing.elderFriendly && (
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">Elder friendly</span>
              )}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-stone-500">
                {amenities.map((a) => {
                  const Icon = amenityIcon(a);
                  return (
                    <span key={a} className="flex items-center gap-1 capitalize">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      {a}
                    </span>
                  );
                })}
                {extraAm > 0 && <span className="text-stone-400">+{extraAm} more</span>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
            <span className="rounded-full border border-stone-200 bg-cream px-3 py-1.5 font-mono text-[13px] font-semibold text-stone-900">
              {formatPricePerNight(listing.pricePerNight)}
              <span className="ml-1 font-sans text-[11px] font-normal text-stone-400">/night</span>
            </span>
            <p className="flex items-center gap-1 text-[13px] text-stone-600">
              <span className="text-[#eab308]">★</span>
              <span className="font-semibold text-stone-900">{listing.avgRating?.toFixed(1) || "—"}</span>
              <span className="text-[12px] text-stone-400">({listing.reviewCount ?? 0})</span>
            </p>
          </div>
        </Link>
      </motion.div>
    );
  }

  /* ── Horizontal variant (search results) ─────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        to={detailTo}
        className={cn(
          "group flex overflow-hidden rounded-[18px] border border-stone-200 bg-white transition-all duration-250",
          "hover:-translate-y-[2px] hover:border-brand-200 hover:shadow-[0_16px_40px_-20px_rgba(15,45,30,.22)]",
          className
        )}
      >
        {/* Photo */}
        <div className="relative h-[130px] w-[170px] shrink-0 overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
          {photo ? (
            <img src={photo} alt={`Photo of ${title}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
          ) : (
            <Home className="absolute inset-0 m-auto h-8 w-8 text-brand-300" aria-hidden />
          )}
          <button
            type="button"
            onClick={onToggleLike}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 shadow backdrop-blur-sm hover:bg-white"
            aria-label={liked ? "Remove from wishlist" : "Save"}
          >
            <Heart className={cn("h-3.5 w-3.5 transition-colors", liked ? "fill-red-500 text-red-500" : "fill-transparent text-stone-500")} />
          </button>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                {typePill}
              </span>
              <h3 className="mt-1 line-clamp-1 text-[14px] font-semibold text-stone-900">{title}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-stone-500">
                <MapPin className="h-3 w-3 shrink-0 text-stone-400" />
                {locLine}
                {dist && <><span className="text-stone-300">·</span><span className="font-medium text-brand-700">{dist}</span></>}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[15px] font-semibold text-brand-800">{formatPricePerNight(listing.pricePerNight)}</p>
              <p className="text-[11px] text-stone-400">/night</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex flex-wrap gap-1.5">
              {kyc && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  <ShieldCheck className="h-3 w-3" /> KYC
                </span>
              )}
              {listing.womenSafe && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">Women safe</span>}
              {listing.elderFriendly && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">Elder friendly</span>}
            </div>
            <p className="flex items-center gap-0.5 text-[13px]">
              <span className="text-[#eab308]">★</span>
              <span className="font-semibold text-stone-900">{listing.avgRating?.toFixed(1) || "—"}</span>
              <span className="text-[11px] text-stone-400">({listing.reviewCount ?? 0})</span>
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
