import { Bath, Building2, Car, CookingPot, Flame, Home, Monitor, Wind, Wifi, WashingMachine } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "@utils/cn.js";
import { formatDistanceKm, formatPricePerNight, listingDisplayTitle, listingLocationLine } from "@utils/format.js";

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

  const thumb = (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50",
        variant === "horizontal" ? "h-20 w-[100px] rounded-l-xl rounded-r-none" : "aspect-[16/10] w-full rounded-t-xl"
      )}
    >
      {photo ? (
        <img
          src={photo}
          alt={`Photo of ${title}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Home className={cn("text-brand-400", variant === "horizontal" ? "h-8 w-8" : "h-14 w-14")} aria-hidden />
      )}
      {hubName && variant !== "horizontal" ? (
        <span className="absolute bottom-2 left-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-medium text-white">
          {hubName}
        </span>
      ) : null}
    </div>
  );

  const meta = (
    <>
      <span className="inline-flex w-fit rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
        {typePill}
      </span>
      <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900">{title}</h3>
      <p className="mt-0.5 text-[13px] text-stone-500">
        {locLine}
        {dist ? (
          <>
            {" "}
            · <span className="font-semibold text-stone-700">{dist}</span>
          </>
        ) : null}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {kyc ? (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-medium text-green-800">KYC verified</span>
        ) : null}
        {listing.womenSafe ? (
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-medium text-purple-800">Women safe</span>
        ) : null}
        {listing.elderFriendly ? (
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-medium text-orange-800">
            Elder friendly
          </span>
        ) : null}
      </div>
      {amenities.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-stone-500">
          {amenities.map((a) => {
            const Icon = amenityIcon(a);
            return (
              <span key={a} className="flex items-center gap-1 capitalize">
                <Icon className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden />
                {a}
              </span>
            );
          })}
          {extraAm > 0 ? <span className="text-stone-400">+{extraAm} more</span> : null}
        </div>
      ) : null}
    </>
  );

  const foot = (
    <div className="mt-auto flex items-center justify-between pt-3">
      <p className="font-price text-base font-semibold text-stone-900">
        {formatPricePerNight(listing.pricePerNight)}
        <span className="text-xs font-normal text-stone-400">/night</span>
      </p>
      <p className="flex items-center gap-0.5 text-stone-600">
        <span className="text-sm text-[#eab308]" aria-hidden>
          ★
        </span>
        <span className="text-sm font-medium text-stone-900">{listing.avgRating?.toFixed(1) || "—"}</span>
        <span className="text-xs text-stone-400">({listing.reviewCount ?? 0})</span>
      </p>
    </div>
  );

  if (variant === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.01 }}
      >
        <Link
          to={detailTo}
          className={cn(
            "listing-card flex cursor-pointer gap-0 overflow-hidden rounded-xl border border-stone-200 bg-white",
            className
          )}
        >
          {thumb}
          <div className="flex min-w-0 flex-1 flex-col py-3 pl-3 pr-3">
            {meta}
            {foot}
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(26,71,49,0.1)" }}
    >
      <Link
        to={detailTo}
        className={cn("listing-card block cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-white", className)}
      >
        {thumb}
        <div className="p-3">{meta}</div>
        <div className="border-t border-stone-200 px-3 py-2">{foot}</div>
      </Link>
    </motion.div>
  );
}
