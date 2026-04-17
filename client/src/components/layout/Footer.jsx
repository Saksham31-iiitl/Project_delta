import { Mail, MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const col = "flex flex-col gap-2";

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-10">
          <div>
            <p className="text-sm font-semibold text-stone-900">NearbyStay</p>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-stone-400">
              Wherever the occasion is — stay close.
            </p>
            <div className="mt-4 flex gap-3 text-stone-400">
              <a href="#" className="hover:text-brand-600" aria-label="Social">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-brand-600" aria-label="Chat">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-brand-600" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-stone-900">Product</p>
            <nav className={`${col} mt-3`}>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/search">
                Search stays
              </Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/organizer">
                Create Hub
              </Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/host/listings/new">
                List your space
              </Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/host">
                Host dashboard
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-stone-900">Company</p>
            <nav className={`${col} mt-3`}>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/about">About</Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/blog">Blog</Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/careers">Careers</Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/press">Press</Link>
            </nav>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-stone-900">Support</p>
            <nav className={`${col} mt-3`}>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/help">Help center</Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/contact">Contact us</Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/safety">Safety</Link>
              <Link className="text-[13px] text-stone-500 hover:text-brand-700" to="/trust">Trust &amp; safety</Link>
            </nav>
          </div>
        </div>
        <div className="mt-10 border-t border-stone-200 pt-6 text-center text-[13px] text-stone-400">
          © {new Date().getFullYear()} NearbyStay · Made with ❤️ in India
        </div>
      </div>
    </footer>
  );
}
