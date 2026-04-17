import { lazy, Suspense } from "react";
import { AnimatePresence } from "motion/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { ListingCardSkeleton } from "./components/common/ListingCardSkeleton.jsx";
import { MainLayout } from "./components/layout/MainLayout.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage.jsx"));
const OccasionHubPage = lazy(() => import("./pages/OccasionHubPage.jsx"));
const GuestDashboardPage = lazy(() => import("./pages/dashboard/GuestDashboardPage.jsx"));
const HostDashboardPage = lazy(() => import("./pages/dashboard/HostDashboardPage.jsx"));
const CreateListingPage = lazy(() => import("./pages/CreateListingPage.jsx"));
const OrganizerDashboardPage = lazy(() => import("./pages/dashboard/OrganizerDashboardPage.jsx"));
const CreateHubPage = lazy(() => import("./pages/CreateHubPage.jsx"));
const AdminPanelPage = lazy(() => import("./pages/admin/AdminPanelPage.jsx"));
const ProfilePage  = lazy(() => import("./pages/ProfilePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const AboutPage    = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.AboutPage })));
const BlogPage     = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.BlogPage })));
const CareersPage  = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.CareersPage })));
const PressPage    = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.PressPage })));
const HelpPage     = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.HelpPage })));
const ContactPage  = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.ContactPage })));
const SafetyPage   = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.SafetyPage })));
const TrustPage    = lazy(() => import("./pages/StaticPages.jsx").then((m) => ({ default: m.TrustPage })));

function SuspensePage({ children }) {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <ListingCardSkeleton horizontal />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route path="/dashboard/guest" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard/host" element={<Navigate to="/host" replace />} />
      <Route path="/dashboard/organizer" element={<Navigate to="/organizer" replace />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<SuspensePage><HomePage /></SuspensePage>} />
        <Route path="/search" element={<SuspensePage><SearchPage /></SuspensePage>} />
        <Route path="/listings/:id" element={<SuspensePage><ListingDetailPage /></SuspensePage>} />
        <Route path="/e/:code" element={<SuspensePage><OccasionHubPage /></SuspensePage>} />
        <Route path="/login" element={<SuspensePage><LoginPage /></SuspensePage>} />
        <Route path="/profile" element={<ProtectedRoute><SuspensePage><ProfilePage /></SuspensePage></ProtectedRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <GuestDashboardPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <HostDashboardPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings/new"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <CreateListingPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <OrganizerDashboardPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/create"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <CreateHubPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SuspensePage>
                <AdminPanelPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route path="/about"    element={<SuspensePage><AboutPage /></SuspensePage>} />
        <Route path="/blog"     element={<SuspensePage><BlogPage /></SuspensePage>} />
        <Route path="/careers"  element={<SuspensePage><CareersPage /></SuspensePage>} />
        <Route path="/press"    element={<SuspensePage><PressPage /></SuspensePage>} />
        <Route path="/help"     element={<SuspensePage><HelpPage /></SuspensePage>} />
        <Route path="/contact"  element={<SuspensePage><ContactPage /></SuspensePage>} />
        <Route path="/safety"   element={<SuspensePage><SafetyPage /></SuspensePage>} />
        <Route path="/trust"    element={<SuspensePage><TrustPage /></SuspensePage>} />
        <Route path="*" element={<SuspensePage><NotFoundPage /></SuspensePage>} />
      </Route>
    </Routes>
    </AnimatePresence>
  );
}
