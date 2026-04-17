import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import * as authApi from "@api/auth.api.js";
import { Button } from "@components/common/Button.jsx";
import { Input } from "@components/common/Input.jsx";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";
import { useAuthStore } from "@stores/authStore.js";
import { sanitizeAuthUser } from "@utils/authUser.js";

const phoneSchema = z.object({ phone: z.string().min(10, "Enter valid phone") });
const otpSchema = z.object({ otp: z.string().min(4, "Enter OTP") });

export default function LoginPage() {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();

  const phoneForm = useForm({ resolver: zodResolver(phoneSchema), defaultValues: { phone: "" } });
  const otpForm = useForm({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });

  const send = phoneForm.handleSubmit(async ({ phone: p }) => {
    try {
      await authApi.sendOtp(p);
      setPhone(p);
      setStep("otp");
      toast.success("OTP sent");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send OTP");
    }
  });

  const verify = otpForm.handleSubmit(async ({ otp }) => {
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      const user = sanitizeAuthUser(data.user);
      setAuth(data.token, user);
      qc.invalidateQueries({ queryKey: ["me"] });

      // Personalised welcome toast
      const name = user?.fullName?.split(" ")[0];
      toast.success(name ? `Welcome back, ${name}! 👋` : "Welcome back!");

      // Smart role-based redirect — only if no explicit ?redirect= was set
      const hasExplicitRedirect = params.get("redirect");
      if (!hasExplicitRedirect) {
        const roles = user?.roles || [];
        if (roles.includes("host"))       return navigate("/host",      { replace: true });
        if (roles.includes("organizer"))  return navigate("/organizer", { replace: true });
        return navigate("/", { replace: true });
      }
      navigate(redirect, { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid OTP");
    }
  });

  return (
    <PageWrapper className="max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700">
            <span className="text-xl">🏠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-900">Welcome back</h1>
            <p className="text-sm text-stone-500">Login with your phone number</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.form
              key="phone-step"
              className="space-y-4"
              onSubmit={send}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Input id="phone" label="Phone number" placeholder="+91 98765 43210" {...phoneForm.register("phone")} error={phoneForm.formState.errors.phone?.message} />
              <Button type="submit" className="w-full">
                Send OTP
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-step"
              className="space-y-4"
              onSubmit={verify}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                OTP sent to <span className="font-semibold">{phone}</span>
              </p>
              <Input id="otp" label="Enter OTP" placeholder="• • • • • •" {...otpForm.register("otp")} error={otpForm.formState.errors.otp?.message} />
              <Button type="submit" className="w-full">
                Verify & Login
              </Button>
              <button type="button" className="text-sm text-brand-600 hover:underline" onClick={() => setStep("phone")}>
                ← Change number
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </PageWrapper>
  );
}
