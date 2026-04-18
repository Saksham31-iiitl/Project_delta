import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as adminApi from "@api/admin.api.js";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

export default function AdminPanelPage() {
  const qc = useQueryClient();

  const { data: pending = [], isPending, isError, error } = useQuery({
    queryKey: ["admin-pending-listings"],
    queryFn: () => adminApi.pendingListings().then((r) => r.data),
    retry: false,
  });

  const { data: kycPending = [], isPending: kycLoading } = useQuery({
    queryKey: ["admin-kyc-pending"],
    queryFn: () => adminApi.pendingKyc().then((r) => r.data),
    retry: false,
  });

  const approveMut = useMutation({
    mutationFn: (id) => adminApi.approveListing(id).then((r) => r.data),
    onSuccess: () => { toast.success("Approved"); qc.invalidateQueries({ queryKey: ["admin-pending-listings"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const rejectMut = useMutation({
    mutationFn: (id) => adminApi.rejectListing(id).then((r) => r.data),
    onSuccess: () => { toast.message("Rejected"); qc.invalidateQueries({ queryKey: ["admin-pending-listings"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const approveKycMut = useMutation({
    mutationFn: (userId) => adminApi.approveKyc(userId).then((r) => r.data),
    onSuccess: () => { toast.success("KYC Approved"); qc.invalidateQueries({ queryKey: ["admin-kyc-pending"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const rejectKycMut = useMutation({
    mutationFn: (userId) => adminApi.rejectKyc(userId).then((r) => r.data),
    onSuccess: () => { toast.message("KYC Rejected"); qc.invalidateQueries({ queryKey: ["admin-kyc-pending"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  if (isError) {
    return (
      <PageWrapper>
        <p className="text-red-600">{error?.response?.status === 403 ? "Not allowed." : "Could not load admin data."}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Listings */}
      <h1 className="text-xl font-semibold">Admin — Pending Listings</h1>
      {isPending ? <p className="mt-4 text-stone-500">Loading…</p> : null}
      <ul className="mt-4 space-y-3">
        {pending.map((l) => (
          <li key={l._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 p-3 text-sm">
            <span>{l.type} · {l._id}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="confirm" disabled={approveMut.isPending} onClick={() => approveMut.mutate(l._id)}>Approve</Button>
              <Button size="sm" variant="danger" disabled={rejectMut.isPending} onClick={() => rejectMut.mutate(l._id)}>Reject</Button>
            </div>
          </li>
        ))}
      </ul>
      {!isPending && pending.length === 0 && <p className="mt-4 text-stone-500">No pending listings.</p>}

      {/* KYC */}
      <h2 className="mt-10 text-xl font-semibold">Admin — Pending KYC</h2>
      {kycLoading ? <p className="mt-4 text-stone-500">Loading…</p> : null}
      <ul className="mt-4 space-y-4">
        {kycPending.map((u) => (
          <li key={u._id} className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">{u.fullName || "—"}</p>
                <p className="text-stone-500">{u.email}</p>
                <p className="mt-1 text-xs text-stone-400">ID: {u._id}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="confirm" disabled={approveKycMut.isPending} onClick={() => approveKycMut.mutate(u._id)}>Approve</Button>
                <Button size="sm" variant="danger" disabled={rejectKycMut.isPending} onClick={() => rejectKycMut.mutate(u._id)}>Reject</Button>
              </div>
            </div>
            {u.aadhaarRef && (
              <a href={u.aadhaarRef} target="_blank" rel="noreferrer" className="mt-3 block">
                <img src={u.aadhaarRef} alt="Aadhaar" className="h-40 rounded-lg border border-stone-200 object-cover" />
                <p className="mt-1 text-xs text-brand-600 hover:underline">View full image ↗</p>
              </a>
            )}
          </li>
        ))}
      </ul>
      {!kycLoading && kycPending.length === 0 && <p className="mt-4 text-stone-500">No pending KYC requests.</p>}
    </PageWrapper>
  );
}
