import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore.js";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message;
    if (status === 401) {
      useAuthStore.getState().logout();
      const path = `${window.location.pathname}${window.location.search}`;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign(`/login?redirect=${encodeURIComponent(path)}`);
      }
    } else if (status === 403) {
      toast.error(msg || "You do not have permission.");
    } else if (status === 404 || status === 400) {
      if (msg) toast.error(String(msg));
    } else if (!err.response) {
      toast.error("Network error. Check your connection and try again.");
    } else if (status >= 500) {
      toast.error("Something went wrong. Please retry.");
    }
    return Promise.reject(err);
  }
);
