import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Home, Mail, Shield, ShieldCheck, Star, Users } from "lucide-react";
import * as authApi from "@api/auth.api.js";
import { Button } from "@components/common/Button.jsx";
import { useAuthStore } from "@stores/authStore.js";
import { sanitizeAuthUser } from "@utils/authUser.js";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

/* ─── OTP Box Input ─────────────────────────────────────── */
function OtpBoxes({ value, onChange }) {
  const len = 6;
  const refs = useRef([]);
  const digits = value.split("").concat(Array(len).fill("")).slice(0, len);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.map((d, idx) => (idx === i ? "" : d)).join("");
      onChange(next);
      if (i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("");
    onChange(next);
    if (char && i < len - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, len);
    onChange(pasted.padEnd(len, "").slice(0, len));
    refs.current[Math.min(pasted.length, len - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-full rounded-xl border-2 text-center text-lg font-bold transition-all focus:outline-none sm:h-13 ${
            d
              ? "border-brand-500 bg-brand-50 text-brand-900"
              : "border-stone-200 bg-white text-stone-900 focus:border-brand-400"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Resend Timer ──────────────────────────────────────── */
function ResendTimer({ onResend }) {
  const [secs, setSecs] = useState(30);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  if (secs > 0) {
    return (
      <p className="text-center text-sm text-stone-400">
        Resend OTP in <span className="font-semibold text-brand-600">{secs}s</span>
      </p>
    );
  }
  return (
    <button
      type="button"
      className="w-full text-center text-sm font-medium text-brand-600 hover:underline"
      onClick={() => { onResend(); setSecs(30); }}
    >
      Resend OTP
    </button>
  );
}

/* ─── Component ─────────────────────────────────────────── */
export default function LoginPage() {
  const [step, setStep]     = useState("email");
  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const redirect  = params.get("redirect") || "/";
  const setAuth   = useAuthStore((s) => s.setAuth);
  const qc        = useQueryClient();

  const isHostFlow = redirect.includes("/host") || redirect.includes("/organizer");

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const send = emailForm.handleSubmit(async ({ email: e }) => {
    setLoading(true);
    try {
      await authApi.sendOtp(e);
      setEmail(e);
      setStep("otp");
      setOtp("");
      toast.success("OTP sent to " + e);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  });

  const verify = async () => {
    if (otp.replace(/\D/g, "").length < 6) {
      toast.error("Enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(email, otp);
      const user = sanitizeAuthUser(data.user);
      setAuth(data.token, user);
      qc.invalidateQueries({ queryKey: ["me"] });

      const name = user?.fullName?.split(" ")[0];
      toast.success(name ? `Welcome, ${name}! 👋` : "Welcome!");

      const hasExplicit = params.get("redirect");
      if (!hasExplicit) {
        const roles = user?.roles || [];
        if (roles.includes("host"))      return navigate("/host",      { replace: true });
        if (roles.includes("organizer")) return navigate("/organizer", { replace: true });
        return navigate("/", { replace: true });
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP — please try again");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otp.replace(/\D/g, "").length === 6 && step === "otp") verify();
  }, [otp]);

  const resend = async () => {
    try {
      await authApi.sendOtp(email);
      toast.success("OTP resent to " + email);
    } catch {
      toast.error("Could not resend OTP");
    }
  };

  /* ── Context content ── */
  const ctx = isHostFlow
    ? {
        icon: Home,
        badge: "For Hosts",
        title: "Start hosting today",
        sub: "List your spare room and earn from nearby events",
        points: [
          { icon: Star,       text: "You set your own price" },
          { icon: ShieldCheck, text: "Guests are Aadhaar verified" },
          { icon: Users,      text: "You approve every booking" },
        ],
        img: "https://images.pexels.com/photos/16314538/pexels-photo-16314538.jpeg?auto=compress&cs=tinysrgb&w=800&q=85",
      }
    : {
        icon: Home,
        badge: "For Guests",
        title: "Find stays near your event",
        sub: "Verified rooms within walking distance of any celebration",
        points: [
          { icon: ShieldCheck, text: "KYC verified hosts only" },
          { icon: Shield,      text: "Secure Razorpay payments" },
          { icon: Star,        text: "Real reviews from guests" },
        ],
        img: "https://images.pexels.com/photos/32293298/pexels-photo-32293298.jpeg?auto=compress&cs=tinysrgb&w=800&q=85",
      };

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-cream px-4 py-8">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl lg:flex">

        {/* ── Left panel — brand / context (desktop only) ── */}
        <div className="relative hidden lg:flex lg:w-[44%] lg:flex-col lg:justify-between">
          <img
            src={ctx.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 to-brand-700/80" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <div>
              <p className="text-xl font-bold text-white">HostTheGuest</p>
              <p className="mt-0.5 text-xs text-brand-200">host THE Guest!</p>
            </div>
            <div>
              <span className="inline-block rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-300">
                {ctx.badge}
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white">
                {ctx.title}
              </h2>
              <p className="mt-2 text-sm text-brand-200">{ctx.sub}</p>
              <ul className="mt-6 space-y-3">
                {ctx.points.map((p) => (
                  <li key={p.text} className="flex items-center gap-3 text-sm text-white/90">
                    <p.icon className="h-4 w-4 shrink-0 text-accent-400" />
                    {p.text}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[11px] text-brand-300">
              By continuing you agree to our Terms &amp; Privacy Policy
            </p>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-10">
          {/* Mobile header */}
          <div className="mb-8 lg:hidden">
            <p className="text-lg font-bold text-brand-900">HostTheGuest</p>
            <p className="mt-0.5 text-xs text-stone-400">host THE Guest!</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-2xl font-bold text-stone-900">Enter your email</h1>
                <p className="mt-1 text-sm text-stone-500">
                  We'll send a 6-digit OTP — no password needed
                </p>

                <form onSubmit={send} className="mt-8 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Email address
                    </label>
                    <div className="flex overflow-hidden rounded-xl border-2 border-stone-200 transition-all focus-within:border-brand-400">
                      <span className="flex items-center border-r border-stone-200 bg-stone-50 px-3 text-stone-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 bg-white px-3 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                        {...emailForm.register("email")}
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending…" : "Send OTP →"}
                  </Button>
                </form>

                {/* Trust row */}
                <div className="mt-8 flex items-center justify-center gap-4 border-t border-stone-100 pt-6">
                  {ctx.points.map((p) => (
                    <div key={p.text} className="flex flex-col items-center gap-1 text-center">
                      <p.icon className="h-4 w-4 text-brand-500" />
                      <span className="text-[10px] text-stone-400">{p.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-2xl font-bold text-stone-900">Check your inbox</h1>
                <p className="mt-1 text-sm text-stone-500">
                  OTP sent to{" "}
                  <span className="font-semibold text-stone-800">{email}</span>
                  {" · "}
                  <button
                    type="button"
                    className="text-brand-600 hover:underline"
                    onClick={() => setStep("email")}
                  >
                    Change
                  </button>
                </p>

                <div className="mt-8 space-y-5">
                  <OtpBoxes value={otp} onChange={setOtp} />

                  <Button
                    type="button"
                    className="w-full"
                    disabled={loading || otp.replace(/\D/g, "").length < 6}
                    onClick={verify}
                  >
                    {loading ? "Verifying…" : "Verify & Continue →"}
                  </Button>

                  <ResendTimer onResend={resend} />
                </div>

                <p className="mt-8 text-center text-xs text-stone-400">
                  Didn't get the email? Check your spam folder or wait 30s to resend.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
