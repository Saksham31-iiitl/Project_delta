import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, ChevronRight, MapPin, Search, ShieldCheck, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import * as bookingsApi from "@api/bookings.api.js";
import * as usersApi from "@api/users.api.js";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { Spinner } from "@components/common/Spinner.jsx";
import { formatInr } from "@utils/format.js";

const STATUS = {
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", cls: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border-red-200" },
  completed: { label: "Completed", cls: "bg-brand-50 text-brand-700 border-brand-200" },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: "bg-stone-50 text-stone-600 border-stone-200" };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function KycBanner() {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => usersApi.getMe().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (file) => usersApi.submitKyc(file).then((r) => r.data),
    onSuccess: () => {
      toast.success("Aadhaar submitted — we'll verify within 24 hours");
      setPreview(null);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Upload failed"),
  });

  if (!me || me.kycStatus === "verified") return null;

  const status = me.kycStatus;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview({ file, url: URL.createObjectURL(file) });
  };

  return (
    <motion.div
      className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          {status === "none" && (
            <>
              <p className="text-sm font-semibold text-amber-800">Complete your KYC</p>
              <p className="mt-0.5 text-xs text-amber-700">Upload your Aadhaar card to get verified and unlock full access.</p>
              {preview ? (
                <div className="mt-3 space-y-2">
                  <img src={preview.url} alt="Aadhaar preview" className="h-32 rounded-lg object-cover border border-amber-200" />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate(preview.file)}>
                      {mutation.isPending ? "Uploading…" : "Submit"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setPreview(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload Aadhaar image
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </>
          )}
          {status === "pending" && (
            <>
              <p className="text-sm font-semibold text-amber-800">KYC under review</p>
              <p className="mt-0.5 text-xs text-amber-700">Your Aadhaar has been submitted. We'll verify within 24 hours.</p>
            </>
          )}
          {status === "rejected" && (
            <>
              <p className="text-sm font-semibold text-red-700">KYC rejected — please resubmit</p>
              <p className="mt-0.5 text-xs text-red-600">Your previous submission was rejected. Upload a clearer image.</p>
              {preview ? (
                <div className="mt-3 space-y-2">
                  <img src={preview.url} alt="Aadhaar preview" className="h-32 rounded-lg object-cover border border-red-200" />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate(preview.file)}>
                      {mutation.isPending ? "Uploading…" : "Resubmit"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setPreview(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload new Aadhaar image
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GuestDashboardPage() {
  const { data: bookings = [], isPending } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingsApi.myBookings().then((r) => r.data),
  });

  return (
    <PageWrapper className="max-w-2xl">
      <KycBanner />
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Trips</h1>
          <p className="mt-0.5 text-sm text-stone-500">All your bookings in one place</p>
        </div>
        <Link to="/search">
          <Button variant="secondary" className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Find stays
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {/* Empty state */}
      {!isPending && bookings.length === 0 && (
        <motion.div
          className="flex flex-col items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
            <Calendar className="h-8 w-8 text-brand-400" />
          </div>
          <h2 className="text-base font-semibold text-stone-900">No trips yet</h2>
          <p className="mt-2 max-w-xs text-sm text-stone-500">
            Find a verified stay near your next wedding, pooja, or family gathering.
          </p>
          <Link to="/search" className="mt-5">
            <Button variant="accent">Browse nearby stays →</Button>
          </Link>
        </motion.div>
      )}

      {/* Bookings list */}
      {!isPending && bookings.length > 0 && (
        <motion.ul
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        >
          {bookings.map((b) => (
            <motion.li
              key={b._id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
            >
              <Link to={`/listings/${b.listingId}`} className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <MapPin className="h-5 w-5 text-brand-600" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-xs text-stone-400">{b._id?.slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-stone-500">
                    <Calendar className="mr-1 inline h-3.5 w-3.5 text-stone-400" />
                    {fmt(b.checkIn)} – {fmt(b.checkOut)}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-stone-900">{formatInr(b.totalAmount)}</p>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </PageWrapper>
  );
}
