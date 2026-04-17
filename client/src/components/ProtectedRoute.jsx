import { useAuthStore } from "@stores/authStore.js";
import { Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute({ children, roles }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const loc = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }

  if (roles?.length && user?.roles) {
    const ok = roles.some((r) => user.roles.includes(r));
    if (!ok) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-lg font-semibold text-stone-900">Access denied</h1>
          <p className="mt-2 text-stone-600">You do not have permission for this page.</p>
        </div>
      );
    }
  }

  return children;
}
