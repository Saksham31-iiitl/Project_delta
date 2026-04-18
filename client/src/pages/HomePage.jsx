import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import {
  Building2,
  Cake,
  Check,
  Heart,
  Home,
  Hotel,
  Lock,
  MapPin,
  PartyPopper,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

/* ─── helpers ─────────────────────────────────────────── */

const occasionChips = [
  { label: "Wedding",    icon: Heart,       to: "/search" },
  { label: "Pooja",      icon: Sparkles,    to: "/search" },
  { label: "Birthday",   icon: Cake,        to: "/search" },
  { label: "Navratri",   icon: Sparkles,    to: "/search" },
  { label: "Hospital",   icon: Building2,   to: "/search" },
  { label: "Party",      icon: PartyPopper, to: "/search" },
  { label: "Gathering",  icon: Users,       to: "/search" },
  { label: "Any occasion", icon: MapPin,    to: "/search" },
];

const propertyTypes = [
  {
    label: "Room",
    desc: "Private room in a family home",
    icon: Home,
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    from: "from-brand-700",
    to: "to-brand-500",
  },
  {
    label: "Floor",
    desc: "Entire floor, your own entrance",
    icon: Building2,
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80",
    from: "from-brand-800",
    to: "to-brand-600",
  },
  {
    label: "Home",
    desc: "Full house, perfect for families",
    icon: Hotel,
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    from: "from-accent-600",
    to: "to-accent-500",
  },
  {
    label: "Suite",
    desc: "Premium suite with extra comforts",
    icon: Star,
    img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80",
    from: "from-teal-600",
    to: "to-brand-500",
  },
  {
    label: "Farmhouse",
    desc: "Scenic space with open grounds",
    icon: Trees,
    img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=400&q=80",
    from: "from-brand-900",
    to: "to-brand-700",
  },
];

const occasions = [
  {
    label: "Wedding",
    desc: "Stays for the entire shaadi week",
    img: "https://images.pexels.com/photos/32293298/pexels-photo-32293298.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
  },
  {
    label: "Pooja & Festival",
    desc: "Near mandaps & celebration venues",
    img: "https://images.pexels.com/photos/36854238/pexels-photo-36854238.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
  },
  {
    label: "Birthday & Party",
    desc: "Party all night, sleep close by",
    img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Family Gathering",
    desc: "Whole floor for the whole family",
    img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
  },
];

/* ─── Animated counter ─────────────────────────────────── */
function AnimatedCounter({ target, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(typeof target === "number" ? target : 0);
  }, [inView, motionVal, target]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (typeof target === "number") setDisplay(Math.round(v).toLocaleString("en-IN"));
    });
  }, [spring, target]);

  if (typeof target !== "number") {
    return (
      <span ref={ref} className={inView ? "animate-fade-up" : "opacity-0"}>
        {prefix}{target}{suffix}
      </span>
    );
  }
  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ─── stagger container ────────────────────────────────── */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ─── Component ────────────────────────────────────────── */
export default function HomePage() {
  const [heroQuery, setHeroQuery] = useState("");
  const navigate = useNavigate();

  const onHeroSearch = (e) => {
    e.preventDefault();
    const q = heroQuery.trim();
    const p = new URLSearchParams();
    if (q) p.set("area", q);
    navigate(`/search${p.toString() ? `?${p}` : ""}`);
  };

  return (
    <PageWrapper className="max-w-none px-0">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:min-h-[88vh]">

          {/* Left — text content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-12 pt-16 sm:px-10 sm:pt-20 lg:py-24 lg:pl-16 lg:pr-10">
            {/* Blobs only on left panel */}
            <div className="hero-blob animate-float      -top-16 -left-16 h-64 w-64 bg-brand-200/50" />
            <div className="hero-blob animate-float-x    bottom-10 left-1/2  h-32 w-32 bg-accent-400/20" />

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-700"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              Find stays near your event — in minutes
            </motion.div>

            <motion.h1
              className="relative font-display text-[32px] font-bold leading-tight text-brand-900 sm:text-[44px] lg:text-[48px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Wherever the<br />occasion is,
              <br />
              <span className="text-accent-500">stay close.</span>
            </motion.h1>

            <motion.p
              className="relative mt-4 max-w-md text-base text-stone-500"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Find verified rooms and homes within walking distance of any wedding, pooja, or family gathering.
            </motion.p>

            {/* Search bar */}
            <motion.form
              onSubmit={onHeroSearch}
              className="relative mt-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="group flex h-14 items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-4 shadow-md transition-all duration-200 focus-within:border-brand-400 focus-within:shadow-lg focus-within:shadow-brand-100">
                <Search className="h-5 w-5 shrink-0 text-stone-400 transition-colors group-focus-within:text-brand-500" aria-hidden />
                <input
                  type="search"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Enter venue or area name…"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0 sm:text-base"
                  aria-label="Search venue or area"
                />
                <Button type="submit" size="md" variant="accent" className="btn-glow shrink-0">
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Occasion chips */}
            <motion.div
              className="relative mt-5 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <p className="mb-2 text-xs font-medium text-stone-500">Popular occasions</p>
              <motion.div
                className="chip-scroll flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {occasionChips.map((chip) => {
                  const ChipIcon = chip.icon;
                  return (
                    <motion.div key={chip.label} variants={staggerItem}>
                      <Link
                        to={chip.to}
                        className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-sm"
                      >
                        <ChipIcon className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                        {chip.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            <motion.p
              className="relative mt-6 text-sm text-stone-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Hosting an event?{" "}
              <Link to="/organizer" className="font-medium text-accent-600 underline-offset-2 hover:underline">
                Create an Occasion Hub →
              </Link>
            </motion.p>
          </div>

          {/* Right — hero image */}
          <motion.div
            className="relative hidden lg:flex lg:w-[48%] lg:shrink-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <img
              src="https://images.pexels.com/photos/32293298/pexels-photo-32293298.jpeg?auto=compress&cs=tinysrgb&w=900&q=85"
              alt="Traditional Indian wedding ceremony with flower petals"
              className="h-full w-full object-cover"
            />
            {/* Gradient fade on left edge to blend into cream bg */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cream to-transparent" />

            {/* Floating info card over image */}
            <motion.div
              className="absolute bottom-10 left-6 rounded-2xl border border-white/30 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <p className="text-xs font-medium text-stone-500">Nearest stay found</p>
              <p className="mt-0.5 text-base font-bold text-brand-900">3 min walk from venue</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-stone-500">KYC verified host</span>
              </div>
            </motion.div>

            {/* Floating distance badge */}
            <motion.div
              className="absolute right-6 top-10 rounded-xl bg-brand-800 px-3 py-2 text-center shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-lg font-bold text-accent-400">500m</p>
              <p className="text-[10px] text-brand-200">from venue</p>
            </motion.div>
          </motion.div>

          {/* Mobile hero image (below text) */}
          <div className="relative h-56 sm:h-72 lg:hidden">
            <img
              src="https://images.pexels.com/photos/32293298/pexels-photo-32293298.jpeg?auto=compress&cs=tinysrgb&w=800&q=80"
              alt="Traditional Indian wedding celebration"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Property Types Showcase ────────────────────── */}
      <section className="bg-brand-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-brand-900">Every type of stay</h2>
            <p className="mt-2 text-sm text-stone-500">From a spare room to a full farmhouse — verified &amp; near your event</p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {propertyTypes.map((pt) => {
              const PTIcon = pt.icon;
              return (
                <motion.div key={pt.label} variants={staggerItem}>
                  <Link
                    to={`/search?type=${pt.label.toLowerCase()}`}
                    className="card-lift group block overflow-hidden rounded-2xl border border-stone-200 bg-white"
                  >
                    {/* Real photo with gradient overlay */}
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={pt.img}
                        alt={pt.label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Dark gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${pt.from}/60 to-transparent opacity-80`} />
                      {/* Icon badge */}
                      <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <PTIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-brand-900">{pt.label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-stone-500">{pt.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Occasions Image Grid ──────────────────────── */}
      <section className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-brand-900">Every occasion, covered</h2>
            <p className="mt-2 text-sm text-stone-500">From intimate poojas to 500-guest weddings</p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {occasions.map((oc) => (
              <motion.div key={oc.label} variants={staggerItem}>
                <Link
                  to="/search"
                  className="card-lift group relative block overflow-hidden rounded-2xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={oc.img}
                      alt={oc.label}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-sm font-bold text-white">{oc.label}</p>
                      <p className="mt-0.5 text-[11px] text-white/75">{oc.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-stone-900">How it works</h2>
            <p className="mx-auto mt-2 max-w-lg text-base text-stone-500">
              Three simple steps. One powerful platform.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Organizer creates hub",
                body: "Create an event hub and share the link with all guests. Takes under 2 minutes.",
                circle: "bg-brand-700",
                img: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=500&q=75",
                delay: 0,
              },
              {
                n: "02",
                title: "Host lists their space",
                body: "Homeowners list spare rooms, get KYC verified, and start earning from local events.",
                circle: "bg-accent-500",
                textColor: "text-brand-900",
                img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=75",
                delay: 0.1,
              },
              {
                n: "03",
                title: "Guest books nearby",
                body: "Guests see verified stays within 1–2 km of the venue and pay securely online.",
                circle: "bg-teal-600",
                img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=75",
                delay: 0.2,
              },
            ].map((step) => (
              <motion.article
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: step.delay }}
                whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(26,71,49,0.1)" }}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow"
              >
                {/* Step image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${step.circle} ${step.textColor || ""}`}>
                    {step.n}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-stone-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">{step.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────── */}
      <section className="bg-cream px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-8 text-center text-2xl font-bold text-brand-900"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Why guests love it
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Walk to the venue",
                desc: "Find stays within 500m–2km of the celebration. Walk to the mehendi at 2 AM. Stay connected.",
                icon: MapPin,
                bg: "bg-brand-700",
                delay: 0,
              },
              {
                title: "Verified hosts",
                desc: "Aadhaar-backed KYC and trust signals so you always know who you're staying with.",
                icon: ShieldCheck,
                bg: "bg-brand-500",
                delay: 0.1,
              },
              {
                title: "Built for India",
                desc: "Weddings, poojas, family events — flows and messaging tuned for how India celebrates.",
                icon: Sparkles,
                bg: "bg-accent-500",
                delay: 0.2,
              },
            ].map((f) => (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: f.delay }}
                whileHover={{ y: -5, boxShadow: "0 16px 48px rgba(26,71,49,0.12)" }}
                className="rounded-2xl border border-stone-200 bg-white p-6 transition-shadow"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg}`}>
                  <f.icon className="h-6 w-6 text-white" aria-hidden />
                </div>
                <h3 className="mt-5 text-base font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{f.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── For homeowners ────────────────────────────── */}
      <section className="border-t border-brand-100 bg-brand-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-700 md:flex md:items-stretch">
            {/* Left — real room photo */}
            <motion.div
              className="relative hidden md:block md:w-[40%] md:shrink-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.pexels.com/photos/33452539/pexels-photo-33452539.jpeg?auto=compress&cs=tinysrgb&w=600&q=85"
                alt="Comfortable room available for guests"
                className="h-full w-full object-cover"
              />
              {/* Gradient blend right */}
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-brand-800 to-transparent" />
              {/* Verified badge */}
              <motion.div
                className="absolute bottom-6 left-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs text-stone-500">Host status</p>
                <p className="text-base font-bold text-brand-800">✓ KYC Verified</p>
              </motion.div>
            </motion.div>

            {/* Right — content */}
            <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 md:flex-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-400">
                  <Star className="h-3 w-3" /> For Homeowners
                </p>
                <h2 className="font-display text-[26px] font-bold leading-snug text-white">
                  Spare Room?<br />
                  <span className="text-accent-400">Make it pay.</span>
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-brand-200">
                  List your room, floor, or home during local gatherings.<br />
                  You set your own price. No investment needed.
                </p>
                <ul className="mt-5 space-y-2 text-[13px] text-brand-200">
                  {["Aadhaar verified guests only", "Secure Razorpay payments", "You set your own rules"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { v: "You set", l: "your price" },
                    { v: "Fast", l: "payout" },
                    { v: "100%", l: "verified guests" },
                    { v: "0%", l: "hidden fees" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
                      <p className="text-base font-bold text-accent-400">{s.v}</p>
                      <p className="text-[11px] text-brand-200">{s.l}</p>
                    </div>
                  ))}
                </div>
                <Link to="/host/listings/new">
                  <Button size="lg" variant="accent" className="btn-glow w-full sm:w-auto">
                    List Your Space →
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust badges ──────────────────────────────── */}
      <section className="bg-white px-4 py-12 sm:px-6">
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 sm:flex-row sm:gap-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {[
            { icon: Shield,   text: "Aadhaar KYC verified hosts" },
            { icon: Lock,     text: "Secure payments via Razorpay" },
            { icon: Phone,    text: "24/7 support & dispute resolution" },
          ].map((row) => (
            <motion.div key={row.text} variants={staggerItem} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                <row.icon className="h-5 w-5 text-brand-600" aria-hidden />
              </div>
              <span className="text-sm font-medium text-stone-700">{row.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA Banner ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-800 px-4 py-14 sm:px-6">
        <img
          src="https://images.pexels.com/photos/13636259/pexels-photo-13636259.jpeg?auto=compress&cs=tinysrgb&w=1400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="hero-blob animate-float      -top-20 -right-20 h-64 w-64 bg-brand-700/60" />
        <div className="hero-blob animate-float-slow -bottom-16 -left-16 h-48 w-48 bg-accent-500/10" />
        <motion.div
          className="relative z-10 mx-auto max-w-[640px] text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Hosting a wedding or gathering?
          </h2>
          <p className="mt-3 text-[15px] text-brand-200">
            Create an Occasion Hub in seconds and help your guests find nearby stays — no app needed.
          </p>
          <Link to="/organizer" className="mt-8 inline-block">
            <Button size="lg" variant="accent" className="btn-glow">
              Create Occasion Hub →
            </Button>
          </Link>
        </motion.div>
      </section>

    </PageWrapper>
  );
}
