import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import * as bookingsApi from "@api/bookings.api.js";
import * as paymentsApi from "@api/payments.api.js";
import { Button } from "@components/common/Button.jsx";
import { useRazorpay } from "@hooks/useRazorpay.js";
import { formatInr } from "@utils/format.js";
import "react-day-picker/style.css";

const UPI_ID   = import.meta.env.VITE_UPI_ID   || "";
const UPI_NAME = import.meta.env.VITE_UPI_NAME || "HostTheGuest";

const schema = z.object({
  guestsCount: z.coerce.number().int().min(1).max(50),
});

export function BookingWidget({ listing, eventId }) {
  const { ready, openCheckout } = useRazorpay();
  const qc = useQueryClient();
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
  const maxGuests = Math.min(20, Math.max(1, listing.maxGuests || 8));

  const [range, setRange]           = useState();
  const [payMethod, setPayMethod]   = useState("razorpay"); // "razorpay" | "upi"
  const [upiPhase, setUpiPhase]     = useState("idle");     // "idle" | "awaiting" | "done"
  const [upiBookingId, setUpiBookingId] = useState(null);
  const [upiTotal, setUpiTotal]     = useState(0);
  const [utr, setUtr]               = useState("");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { guestsCount: Math.min(2, maxGuests) },
  });

  useEffect(() => {
    form.setValue("guestsCount", Math.min(Number(form.getValues("guestsCount")) || 2, maxGuests));
  }, [maxGuests, form]);

  const guestsCount = useWatch({ control: form.control, name: "guestsCount", defaultValue: Math.min(2, maxGuests) });

  const nights =
    range?.from && range?.to ? Math.max(1, differenceInCalendarDays(range.to, range.from)) : 0;
  const subtotal = nights > 0 ? nights * (listing.pricePerNight || 0) : 0;
  const platformFee = Math.round(subtotal * 0.1);
  const total = subtotal + platformFee;

  const createMut = useMutation({
    mutationFn: (body) => bookingsApi.createBooking(body).then((r) => r.data),
    onError: (e) => toast.error(e.response?.data?.message || "Could not start booking"),
  });

  const verifyMut = useMutation({
    mutationFn: (body) => bookingsApi.verifyBookingPayment(body).then((r) => r.data),
    onSuccess: () => {
      toast.success("Payment recorded");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Verification failed"),
  });

  const upiConfirmMut = useMutation({
    mutationFn: (body) => paymentsApi.confirmUpiPayment(body).then((r) => r.data),
    onSuccess: () => {
      toast.success("UTR submitted — booking pending host confirmation");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      setUpiPhase("done");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not submit UTR"),
  });

  const scrollToWidget = () => {
    document.getElementById("booking-widget")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!range?.from || !range?.to) {
      toast.error("Choose check-in and check-out dates");
      return;
    }
    const checkIn = format(range.from, "yyyy-MM-dd");
    const checkOut = format(range.to, "yyyy-MM-dd");
    try {
      const { booking, order } = await createMut.mutateAsync({
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount: values.guestsCount,
        eventId: eventId || undefined,
        paymentMethod: payMethod,
      });

      if (payMethod === "upi") {
        setUpiBookingId(booking._id);
        setUpiTotal(booking.totalAmount + (booking.platformFee || 0));
        setUpiPhase("awaiting");
        return;
      }

      const amount = order.amount;
      const currency = order.currency || "INR";

      if (!keyId) {
        toast.message("Dev mode: Razorpay key missing — skipping checkout UI");
        return;
      }

      openCheckout({
        key: keyId,
        amount,
        currency,
        order_id: order.id,
        name: "HostTheGuest",
        description: `Booking ${booking._id}`,
        handler: (response) => {
          verifyMut.mutate({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId: booking._id,
          });
        },
        modal: { ondismiss: () => {} },
      });
    } catch {
      /* toast from mutation */
    }
  });

  const bumpGuests = (delta) => {
    const current = Number(guestsCount) || 1;
    const next = Math.min(maxGuests, Math.max(1, current + delta));
    form.setValue("guestsCount", next);
  };

  const checkInLabel = range?.from ? format(range.from, "MMM d") : "Add date";
  const checkOutLabel = range?.to ? format(range.to, "MMM d") : "Add date";

  return (
    <>
      <div
        id="booking-widget"
        className="rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-24"
      >
        <p className="font-price text-[22px] font-semibold text-stone-900">
          {formatInr(listing.pricePerNight)}
          <span className="text-sm font-normal text-stone-400">/night</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-stone-500">
          <span className="text-[#eab308]">★</span>
          {listing.avgRating?.toFixed(1) || "—"} ({listing.reviewCount ?? 0} reviews)
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <p className="mb-2 text-xs font-medium text-stone-600">Dates</p>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-stone-200 text-center text-sm">
              <div className="border-r border-stone-200 px-2 py-3">
                <p className="text-[11px] uppercase tracking-wide text-stone-400">Check-in</p>
                <p className="mt-1 font-medium text-stone-900">{checkInLabel}</p>
              </div>
              <div className="px-2 py-3">
                <p className="text-[11px] uppercase tracking-wide text-stone-400">Check-out</p>
                <p className="mt-1 font-medium text-stone-900">{checkOutLabel}</p>
              </div>
            </div>
            <div className="rdp-booking mt-3 [&_.rdp-root]:w-full [&_.rdp-months]:flex [&_.rdp-months]:justify-center">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                disabled={{ before: new Date() }}
                classNames={{
                  selected: "bg-brand-500 text-white rounded-md",
                  range_middle: "bg-brand-100 text-stone-900 rounded-none",
                  range_start: "bg-brand-500 text-white rounded-md",
                  range_end: "bg-brand-500 text-white rounded-md",
                }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-stone-600">Guests</p>
            <div className="flex items-center justify-between rounded-lg border border-stone-200 px-2 py-1">
              <button
                type="button"
                className="btn-press flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-lg text-stone-600"
                onClick={() => bumpGuests(-1)}
                aria-label="Fewer guests"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-medium">{guestsCount}</span>
              <button
                type="button"
                className="btn-press flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-lg text-stone-600"
                onClick={() => bumpGuests(1)}
                aria-label="More guests"
              >
                +
              </button>
            </div>
            {form.formState.errors.guestsCount ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.guestsCount.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-stone-200 pt-4 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>
                {nights || "—"} night{nights === 1 ? "" : "s"} × {formatInr(listing.pricePerNight)}
              </span>
              <span>{nights ? formatInr(subtotal) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span>{nights ? formatInr(platformFee) : "—"}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold text-stone-900">
              <span>Total</span>
              <span>{nights ? formatInr(total) : "—"}</span>
            </div>
          </div>

          {/* Payment method selector */}
          <div>
            <p className="mb-2 text-xs font-medium text-stone-600">Payment method</p>
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-stone-200 text-sm font-medium">
              <button
                type="button"
                onClick={() => setPayMethod("razorpay")}
                className={`py-2.5 transition-colors ${payMethod === "razorpay" ? "bg-brand-600 text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`}
              >
                Card / Razorpay
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("upi")}
                className={`border-l border-stone-200 py-2.5 transition-colors ${payMethod === "upi" ? "bg-brand-600 text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`}
              >
                Pay via UPI
              </button>
            </div>
          </div>

          {/* UPI awaiting payment panel */}
          {upiPhase === "awaiting" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-800">Complete your UPI payment</p>
              <div className="flex justify-center">
                <img
                  src="/upi-qr.png"
                  alt="UPI QR Code"
                  className="h-44 w-44 rounded-xl border border-blue-200 object-contain bg-white p-1"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div className="rounded-lg bg-white border border-blue-200 px-3 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wider text-stone-400 mb-0.5">UPI ID</p>
                <p className="font-mono font-semibold text-stone-900 select-all">{UPI_ID}</p>
                <p className="text-xs text-stone-400 mt-0.5">{UPI_NAME}</p>
              </div>
              <p className="text-center text-sm font-bold text-blue-900">
                Pay exactly {formatInr(upiTotal)}
              </p>
              <div>
                <p className="mb-1.5 text-xs font-medium text-stone-600">Enter UTR / Transaction ID after payment</p>
                <input
                  type="text"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 123456789012"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={!utr.trim() || upiConfirmMut.isPending}
                onClick={() => upiConfirmMut.mutate({ bookingId: upiBookingId, utr })}
              >
                {upiConfirmMut.isPending ? "Submitting…" : "Confirm payment"}
              </Button>
            </div>
          )}

          {upiPhase === "done" && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-sm font-semibold text-green-800">Payment submitted!</p>
              <p className="mt-1 text-xs text-green-700">Your booking is pending host confirmation. UTR: {utr}</p>
            </div>
          )}

          {upiPhase === "idle" && (
            <Button type="submit" className="h-12 w-full text-base" disabled={createMut.isPending || verifyMut.isPending || (payMethod === "razorpay" && !ready)}>
              {createMut.isPending ? "Processing…" : nights ? `Book now — ${formatInr(total)}` : "Select dates"}
            </Button>
          )}
          <p className="text-center text-xs text-stone-400">You won&apos;t be charged until the host confirms.</p>
        </form>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-stone-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div>
          <p className="font-price text-sm font-semibold text-stone-900">
            {formatInr(listing.pricePerNight)}
            <span className="text-xs font-normal text-stone-400">/night</span>
          </p>
          <p className="text-xs text-stone-500">
            <span className="text-[#eab308]">★</span> {listing.avgRating?.toFixed(1) || "—"}
          </p>
        </div>
        <Button type="button" className="h-11 shrink-0 px-6" onClick={scrollToWidget}>
          Book
        </Button>
      </div>
    </>
  );
}
