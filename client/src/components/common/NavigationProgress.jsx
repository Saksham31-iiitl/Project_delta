import NProgress from "nprogress";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export function NavigationProgress() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => NProgress.done());
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.search]);

  return null;
}
