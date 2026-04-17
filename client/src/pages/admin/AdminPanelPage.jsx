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

  const approveMut = useMutation({
    mutationFn: (id) => adminApi.approveListing(id).then((r) => r.data),
    onSuccess: () => {
      toast.success("Approved");
      qc.invalidateQueries({ queryKey: ["admin-pending-listings"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const rejectMut = useMutation({
    mutationFn: (id) => adminApi.rejectListing(id).then((r) => r.data),
    onSuccess: () => {
      toast.message("Rejected");
      qc.invalidateQueries({ queryKey: ["admin-pending-listings"] });
    },
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
      <h1 className="text-xl font-semibold">Admin — pending listings</h1>
      {isPending ? <p className="mt-4 text-stone-500">Loading…</p> : null}
      <ul className="mt-4 space-y-3">
        {pending.map((l) => (
          <li key={l._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 p-3 text-sm">
            <span>
              {l.type} · {l._id}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="confirm" disabled={approveMut.isPending} onClick={() => approveMut.mutate(l._id)}>
                Approve
              </Button>
              <Button size="sm" variant="danger" disabled={rejectMut.isPending} onClick={() => rejectMut.mutate(l._id)}>
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {!isPending && pending.length === 0 ? <p className="mt-4 text-stone-500">Queue is empty.</p> : null}
    </PageWrapper>
  );
}
