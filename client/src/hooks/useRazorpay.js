import { useCallback, useEffect, useState } from "react";

export function useRazorpay() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const markReady = () => queueMicrotask(() => setReady(true));
    if (window.Razorpay) {
      markReady();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = markReady;
    document.body.appendChild(s);
  }, []);

  const openCheckout = useCallback((opts) => {
    if (!window.Razorpay) return;
    const rzp = new window.Razorpay(opts);
    rzp.open();
  }, []);

  return { ready, openCheckout };
}
