import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white/70">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden>
                <path d="M4 22 L20 6 L36 22 V34 H26 V24 H14 V34 H4 Z" fill="#f5a623"/>
                <circle cx="20" cy="16" r="3" fill="#fff"/>
              </svg>
              <span className="font-display text-xl text-white">HostTheGuest</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed">
              Stays for weddings, poojas, and the celebrations in-between. Made with love, for all of India.
            </p>
          </div>

          {/* Guests */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-white mb-4">Guests</p>
            <nav className="flex flex-col gap-2.5 text-[13px]">
              <Link to="/search" className="hover:text-white transition-colors">Search stays</Link>
              <Link to="/organizer" className="hover:text-white transition-colors">Occasion Hubs</Link>
              <Link to="/safety" className="hover:text-white transition-colors">Trust &amp; safety</Link>
              <Link to="/help" className="hover:text-white transition-colors">Help centre</Link>
            </nav>
          </div>

          {/* Hosts */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-white mb-4">Hosts</p>
            <nav className="flex flex-col gap-2.5 text-[13px]">
              <Link to="/host/listings/new" className="hover:text-white transition-colors">List your space</Link>
              <Link to="/host" className="hover:text-white transition-colors">Host dashboard</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Host community</Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-white mb-4">Company</p>
            <nav className="flex flex-col gap-2.5 text-[13px]">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>
        </div>

        <div className="goldrule-soft mt-12 mb-6" />

        <div className="flex flex-wrap items-center justify-between gap-4 text-[12px]">
          <p>© {new Date().getFullYear()} HostTheGuest · Privacy · Terms</p>
          <p>Made with <span className="text-accent-500">marigolds</span> in India 🌼</p>
        </div>
      </div>
    </footer>
  );
}
