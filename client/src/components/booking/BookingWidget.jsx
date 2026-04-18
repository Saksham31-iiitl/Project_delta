import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import * as bookingsApi from "@api/bookings.api.js";
import { Button } from "@components/common/Button.jsx";
import { useRazorpay } from "@hooks/useRazorpay.js";
import { formatInr } from "@utils/format.js";
import "react-day-picker/style.css";

const schema = z.object({
  guestsCount: z.coerce.number().int().min(1).max(50),
});

export function BookingWidget({ listing, eventId }) {
  const { ready, openCheckout } = useRazorpay();
  const qc = useQueryClient();
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
  const maxGuests = Math.min(20, Math.max(1, listing.maxGuests || 8));

  const [range, setRange] = useState();

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
      });

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

          <Button type="submit" className="h-12 w-full text-base" disabled={createMut.isPending || verifyMut.isPending || !ready}>
            {createMut.isPending ? "Processing…" : nights ? `Book now — ${formatInr(total)}` : "Select dates"}
          </Button>
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
