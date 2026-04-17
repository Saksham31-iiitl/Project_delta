import { motion } from "motion/react";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Rocket,
  Shield,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@components/common/Button.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

/* ── Shared header ──────────────────────────────────────── */
function PageHeader({ label, title, sub, icon: Icon }) {
  return (
    <motion.div
      className="mb-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700">
          <Icon className="h-7 w-7 text-white" />
        </div>
      )}
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-500">{label}</p>
      )}
      <h1 className="font-display text-3xl font-bold text-brand-900 sm:text-4xl">{title}</h1>
      {sub && <p className="mx-auto mt-3 max-w-xl text-base text-stone-500">{sub}</p>}
    </motion.div>
  );
}

/* ── Section card ───────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <motion.div
      className={`rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   ABOUT
═══════════════════════════════════════════════════════════ */
export function AboutPage() {
  const values = [
    { icon: Heart,      title: "Built for India",   desc: "Every feature is designed around how Indian families celebrate — from mehendi nights to 5-day wedding weeks." },
    { icon: ShieldCheck,title: "Trust first",        desc: "Aadhaar KYC, trust scores, and verified reviews mean you always know who you're dealing with." },
    { icon: Users,      title: "Community driven",  desc: "We help homeowners earn and guests celebrate without travel stress — a win for both sides." },
    { icon: Rocket,     title: "Zero to launch",    desc: "Started from a simple observation: there's nowhere to stay near a wedding venue. We're fixing that." },
  ];

  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        label="Our story"
        icon={Star}
        title="We exist for every occasion"
        sub="HostTheGuest was born from a simple frustration — finding a place to stay close to a wedding venue in India is surprisingly hard. We built the solution."
      />

      {/* Story */}
      <Card className="mb-4">
        <h2 className="mb-4 text-lg font-bold text-brand-900">The problem we're solving</h2>
        <div className="space-y-4 text-sm leading-relaxed text-stone-600">
          <p>
            India hosts over <span className="font-semibold text-brand-800">1.2 crore weddings every year</span>. Each wedding
            brings dozens, sometimes hundreds of out-of-town guests who need a place to sleep — ideally within
            walking distance of the venue, not 40 minutes away in a generic hotel.
          </p>
          <p>
            Meanwhile, millions of Indian homeowners have a spare room, a free floor, or an empty farmhouse
            during a local event — but no easy way to rent it out to trusted guests.
          </p>
          <p>
            HostTheGuest connects both sides. We call it <span className="font-semibold text-brand-700">occasion-based stays</span> —
            accommodation that makes sense for the event you're attending, not just the city you're in.
          </p>
        </div>
      </Card>

      {/* Mission */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-700 p-8 text-white">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">Our mission</p>
          <p className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
            Make it effortless for every Indian family to stay close to every celebration that matters.
          </p>
        </motion.div>
      </div>

      {/* Values */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            className="rounded-2xl border border-stone-200 bg-white p-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <v.icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-stone-900">{v.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/search">
          <Button variant="accent" size="lg" className="btn-glow">
            Find a stay near your event →
          </Button>
        </Link>
      </div>
    </PageWrapper>
  );
}

/* ════════════════════════════════════════════════════════
   BLOG
═══════════════════════════════════════════════════════════ */
export function BlogPage() {
  const coming = [
    { tag: "Hosting tips",    title: "How to make your spare room guest-ready in a weekend",   soon: true },
    { tag: "For guests",      title: "5 things to check before booking a stay near a wedding", soon: true },
    { tag: "Platform news",   title: "HostTheGuest's first 100 bookings — what we learned",     soon: true },
    { tag: "India & culture", title: "Why Indian weddings are the world's best hospitality opportunity", soon: true },
  ];

  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        label="Blog"
        icon={BookOpen}
        title="Stories & insights"
        sub="Tips for hosts, guides for guests, and the story behind occasion-based stays in India."
      />

      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-700 p-8 text-center text-white">
        <p className="text-2xl font-bold">We're writing ✍️</p>
        <p className="mt-2 text-brand-200">Our first posts are on their way. Subscribe to get them first.</p>
        <a
          href="mailto:hostttheguest@gmail.com?subject=Subscribe to HostTheGuest blog"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-brand-900 transition-opacity hover:opacity-90"
        >
          <Mail className="h-4 w-4" /> Notify me when posts go live
        </a>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">Coming soon</p>
      <div className="space-y-3">
        {coming.map((post, i) => (
          <motion.div
            key={post.title}
            className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <span className="mt-0.5 shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
              {post.tag}
            </span>
            <p className="text-sm font-medium text-stone-700">{post.title}</p>
            <span className="ml-auto shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-400">
              Soon
            </span>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}

/* ════════════════════════════════════════════════════════
   CAREERS
═══════════════════════════════════════════════════════════ */
export function CareersPage() {
  const perks = [
    "Work on a product used at real Indian weddings",
    "Small team, large ownership — your work ships fast",
    "Remote-first with optional Delhi NCR office",
    "Competitive salary + ESOPs for early hires",
    "Flexible hours around your best work time",
  ];

  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        label="Careers"
        icon={Briefcase}
        title="Join the team"
        sub="We're a small crew building something India has never had before. If that excites you, read on."
      />

      {/* No openings banner */}
      <Card className="mb-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
          <Briefcase className="h-8 w-8 text-stone-400" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">No open positions right now</h2>
        <p className="mt-2 text-sm text-stone-500">
          We're a lean team and we hire slowly. There are no active listings at the moment —
          but that changes. Drop us your resume and we'll reach out when something fits.
        </p>
        <a
          href="mailto:hostttheguest@gmail.com?subject=Career enquiry — HostTheGuest"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <Mail className="h-4 w-4" /> Send us your resume anyway
        </a>
      </Card>

      {/* Why work here */}
      <Card className="mb-4">
        <h2 className="mb-5 text-base font-bold text-brand-900">Why work with us</h2>
        <ul className="space-y-3">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-stone-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Star className="h-3 w-3 text-brand-600" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </Card>

      {/* Domains */}
      <div className="grid gap-3 sm:grid-cols-3">
        {["Engineering", "Design", "Operations & Growth"].map((d, i) => (
          <motion.div
            key={d}
            className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="text-sm font-semibold text-brand-800">{d}</p>
            <p className="mt-1 text-[11px] text-stone-500">Openings when we grow</p>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}

/* ════════════════════════════════════════════════════════
   PRESS
═══════════════════════════════════════════════════════════ */
export function PressPage() {
  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        label="Press & Media"
        icon={MessageCircle}
        title="Media resources"
        sub="Journalists, bloggers, and content creators — everything you need to cover HostTheGuest."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-bold text-brand-900">The one-liner</h2>
          <p className="text-sm text-stone-600">
            HostTheGuest connects guests attending Indian events with verified homeowners who have a spare room —
            so you always stay within walking distance of the celebration.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-bold text-brand-900">Key facts</h2>
          <ul className="space-y-2 text-sm text-stone-600">
            <li>📍 Based in Delhi NCR, India</li>
            <li>🏠 Occasion-based short-term rentals</li>
            <li>🎯 Focus: Weddings, poojas, family events</li>
            <li>🔒 Aadhaar KYC for guests & hosts</li>
            <li>💳 Razorpay-powered secure payments</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-4 text-center">
        <h2 className="mb-2 text-base font-bold text-brand-900">Press enquiries</h2>
        <p className="text-sm text-stone-500">
          For interviews, data requests, or media kit — reach out directly.
        </p>
        <a
          href="mailto:hostttheguest@gmail.com?subject=Press enquiry"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <Mail className="h-4 w-4" /> hostttheguest@gmail.com
        </a>
      </Card>
    </PageWrapper>
  );
}

/* ════════════════════════════════════════════════════════
   HELP CENTER
═══════════════════════════════════════════════════════════ */
function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-stone-800"
        onClick={() => setOpen((o) => !o)}
      >
        {q}
        <ChevronDown className={`ml-4 h-4 w-4 shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.p
          className="pb-4 text-sm leading-relaxed text-stone-500"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {a}
        </motion.p>
      )}
    </div>
  );
}

export function HelpPage() {
  const faqs = [
    {
      section: "For Guests",
      items: [
        { q: "How do I find a stay near my event?", a: "Use the Search page or ask your event organizer to share an Occasion Hub link. The hub shows all verified stays within the set radius of the venue." },
        { q: "Is it safe to book through HostTheGuest?", a: "Yes. All hosts go through Aadhaar-backed KYC verification. Guest reviews and trust scores add further confidence." },
        { q: "How do I pay?", a: "Payments are processed securely via Razorpay. We accept UPI, debit/credit cards, and net banking. Your money is held until the host confirms." },
        { q: "What if the host cancels?", a: "If a host cancels a confirmed booking, you receive a full refund within 3–5 business days. Our support team will also help you find an alternative." },
        { q: "Can I cancel my booking?", a: "Cancellation policies vary by listing. Check the listing details before booking. Most hosts allow free cancellation up to 48 hours before check-in." },
      ],
    },
    {
      section: "For Hosts",
      items: [
        { q: "How do I list my space?", a: "Click 'List Your Space' in the navbar. Fill in your property details, set your price, upload photos, and submit for KYC verification. Once approved, your listing goes live." },
        { q: "When do I get paid?", a: "Payouts are transferred to your registered bank account within 72 hours of guest check-in, after platform fees are deducted." },
        { q: "What is the platform fee?", a: "HostTheGuest charges 8–14% of the booking amount depending on property type. This covers payment processing, support, and platform maintenance." },
        { q: "Can I decline a booking request?", a: "Yes. You have a response window to accept or decline each request. Frequent declines may affect your listing's search ranking." },
      ],
    },
  ];

  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        label="Help Center"
        icon={HelpCircle}
        title="How can we help?"
        sub="Quick answers to the most common questions from guests and hosts."
      />

      <div className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4">
        <p className="text-sm font-medium text-brand-800">Can't find your answer?</p>
        <p className="mt-1 text-xs text-stone-500">
          Reach us at{" "}
          <a href="mailto:hostttheguest@gmail.com" className="font-semibold text-brand-600 hover:underline">
            hostttheguest@gmail.com
          </a>{" "}
          or call{" "}
          <a href="tel:+918081742805" className="font-semibold text-brand-600 hover:underline">
            +91 80817 42805
          </a>
        </p>
      </div>

      {faqs.map((section) => (
        <Card key={section.section} className="mb-4">
          <h2 className="mb-2 text-base font-bold text-brand-900">{section.section}</h2>
          {section.items.map((item) => (
            <Faq key={item.q} q={item.q} a={item.a} />
          ))}
        </Card>
      ))}
    </PageWrapper>
  );
}

/* ════════════════════════════════════════════════════════
   CONTACT US
═══════════════════════════════════════════════════════════ */
export function ContactPage() {
  const channels = [
    {
      icon: Mail,
      label: "Email us",
      value: "hostttheguest@gmail.com",
      sub: "We reply within 24 hours",
      href: "mailto:hostttheguest@gmail.com",
      bg: "bg-brand-50",
      iconCls: "text-brand-600",
    },
    {
      icon: Phone,
      label: "Call us",
      value: "+91 80817 42805",
      sub: "Mon–Sat, 9 AM – 8 PM IST",
      href: "tel:+918081742805",
      bg: "bg-green-50",
      iconCls: "text-green-600",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Chat on WhatsApp",
      sub: "Fastest response channel",
      href: "https://wa.me/918081742805",
      bg: "bg-emerald-50",
      iconCls: "text-emerald-600",
    },
  ];

  return (
    <PageWrapper className="max-w-2xl">
      <PageHeader
        label="Contact"
        icon={Phone}
        title="Get in touch"
        sub="Whether you're a guest, host, or just curious — we'd love to hear from you."
      />

      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      >
        {channels.map((c) => (
          <motion.a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="card-lift flex flex-col items-center rounded-2xl border border-stone-200 bg-white px-5 py-6 text-center transition-colors hover:border-brand-200"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
          >
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
              <c.icon className={`h-6 w-6 ${c.iconCls}`} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{c.label}</p>
            <p className="mt-1 text-sm font-bold text-stone-900">{c.value}</p>
            <p className="mt-1 text-[11px] text-stone-400">{c.sub}</p>
          </motion.a>
        ))}
      </motion.div>

      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
          <div>
            <p className="text-sm font-semibold text-stone-900">Based in Delhi NCR, India</p>
            <p className="mt-1 text-sm text-stone-500">
              We operate across India. Our core focus is on cities with high wedding and event activity —
              Delhi NCR, Mumbai, Jaipur, Bengaluru, and more.
            </p>
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
}

/* ════════════════════════════════════════════════════════
   SAFETY
═══════════════════════════════════════════════════════════ */
export function SafetyPage() {
  const hostTips = [
    "Only accept bookings from KYC-verified guests",
    "Clearly communicate house rules before check-in",
    "Keep a copy of the guest's booking confirmation",
    "Never share your home address publicly — share it only with confirmed guests",
    "Contact support immediately if a guest violates rules",
  ];
  const guestTips = [
    "Only book verified listings with a KYC badge",
    "Read all house rules before confirming",
    "Pay only through the HostTheGuest platform — never via cash or direct transfer",
    "Save the host's contact number before you travel",
    "Report any safety concerns using the in-app support",
  ];

  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        label="Safety"
        icon={Shield}
        title="Your safety is our priority"
        sub="HostTheGuest is built with safety at every step — for guests, for hosts, and for families."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-900">
            <ShieldCheck className="h-5 w-5 text-brand-600" /> For Hosts
          </h2>
          <ul className="space-y-3">
            {hostTips.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-stone-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-900">
            <ShieldCheck className="h-5 w-5 text-green-600" /> For Guests
          </h2>
          <ul className="space-y-3">
            {guestTips.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-stone-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Emergency */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-700 p-6 text-white">
        <h2 className="mb-2 text-base font-bold">Emergency or urgent issue?</h2>
        <p className="text-sm text-brand-200">
          Call or WhatsApp us immediately — we're available 7 days a week for safety-related concerns.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="tel:+918081742805" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25">
            <Phone className="h-4 w-4" /> +91 80817 42805
          </a>
          <a href="mailto:hostttheguest@gmail.com" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:opacity-90">
            <Mail className="h-4 w-4" /> Email support
          </a>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ════════════════════════════════════════════════════════
   TRUST & SAFETY
═══════════════════════════════════════════════════════════ */
export function TrustPage() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Aadhaar KYC verification",
      desc: "Every host must complete Aadhaar-based identity verification before their listing goes live. Guests are verified at booking.",
      color: "bg-brand-50 text-brand-600",
    },
    {
      icon: Star,
      title: "Trust score system",
      desc: "Every user earns a trust score based on booking history, reviews, and platform behaviour. Higher scores unlock more features.",
      color: "bg-accent-500/10 text-accent-600",
    },
    {
      icon: Shield,
      title: "Secure payments only",
      desc: "All transactions happen through Razorpay. We never allow cash deals or off-platform payments — your money is protected.",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Users,
      title: "Review system",
      desc: "Guests and hosts review each other after every stay. Dishonest reviews can be flagged and investigated.",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <PageWrapper className="max-w-3xl">
      <PageHeader
        label="Trust & Safety"
        icon={ShieldCheck}
        title="How we build trust"
        sub="Safety isn't a feature — it's the foundation. Here's how every layer of HostTheGuest is designed around it."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            className="rounded-2xl border border-stone-200 bg-white p-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${p.color}`}>
              <p.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-stone-900">{p.title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-stone-500">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-base font-bold text-brand-900">Report a concern</h2>
        <p className="text-sm text-stone-500">
          If you witness or experience anything that feels unsafe, contact us immediately. Every report is taken seriously
          and reviewed within 2 hours during business hours.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="mailto:hostttheguest@gmail.com?subject=Safety report" className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            <Mail className="h-4 w-4" /> Report via email
          </a>
          <a href="tel:+918081742805" className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50">
            <Phone className="h-4 w-4" /> Call us directly
          </a>
        </div>
      </Card>
    </PageWrapper>
  );
}
