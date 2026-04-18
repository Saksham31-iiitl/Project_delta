import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as eventsApi from "@api/events.api.js";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

export default function OrganizerDashboardPage() {
  const { data: events = [], isPending } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => eventsApi.myEvents().then((r) => r.data),
  });

  return (
    <PageWrapper>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Occasion Hubs</h1>
        <Link to="/organizer/create" className="text-sm font-medium text-brand-600">
          Create hub
        </Link>
      </div>
      {isPending ? <p className="mt-4 text-stone-500">Loading…</p> : null}
      <ul className="mt-4 space-y-3">
        {events.map((e) => (
          <li key={e._id} className="rounded-lg border border-stone-200 p-3">
            <Link to={`/e/${e.inviteCode}`} className="font-medium text-stone-900">
              {e.eventName}
            </Link>
            <p className="text-xs text-stone-500">hosttheguest.in/e/{e.inviteCode}</p>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}
