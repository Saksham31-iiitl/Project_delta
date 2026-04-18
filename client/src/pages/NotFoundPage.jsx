import { motion } from "motion/react";
import { Home, Search, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

export default function NotFoundPage() {
  return (
    <PageWrapper className="max-w-lg">
      <motion.div
        className="flex flex-col items-center py-16 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Big 404 */}
        <div className="relative mb-6 select-none">
          <p className="font-display text-[96px] font-bold leading-none text-brand-100 sm:text-[120px]">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-4xl">🏠</p>
        </div>

        <h1 className="text-2xl font-bold text-stone-900">Page not found</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-500">
          Looks like this room has already been taken! The page you're looking for doesn't exist or may have moved.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/">
            <Button variant="primary" className="flex items-center gap-2">
              <Home className="h-4 w-4" /> Go home
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="secondary" className="flex items-center gap-2">
              <Search className="h-4 w-4" /> Browse stays
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Contact us
            </Button>
          </Link>
        </div>

        <p className="mt-10 text-xs text-stone-400">
          HostTheGuest · Wherever the occasion is, stay close.
        </p>
      </motion.div>
    </PageWrapper>
  );
}
