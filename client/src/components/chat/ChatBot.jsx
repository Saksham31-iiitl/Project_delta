import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { aiGenerate } from "@utils/ai.js";

const AI_ENABLED = !!import.meta.env.VITE_GROQ_API_KEY;

const PLATFORM_CONTEXT = `You are a helpful assistant for HostTheGuest — an Indian platform where guests attending weddings and events can find stays near event venues. Hosts can also list their spaces.

Key facts:
- Guests search by event venue location and find nearby stays
- Payment via UPI or Razorpay (cards)
- Platform fee is 10%
- Hosts submit listings for admin review (approved in 24 hours)
- Contact: ritikamis8081@gmail.com | Phone: +91 8081742805
- Bookings can be instant or request-based
- Refunds follow each listing's cancellation policy

Answer helpfully and concisely in 2-4 sentences. If you don't know something specific, suggest they email ritikamis8081@gmail.com.`;

/* ── Q&A engine ─────────────────────────────────────────── */
const CONTACT_EMAIL = "ritikamis8081@gmail.com";

const QA = [
  {
    keys: ["hi", "hello", "hey", "hola", "namaste"],
    answer: "Hi there! 👋 I'm the HostTheGuest assistant. Ask me anything or pick a topic below.",
  },
  {
    keys: ["how to book", "booking process", "book a stay", "how do i book", "reserve", "make a booking"],
    answer:
      "Booking is easy!\n1. Search for stays near your event venue\n2. Pick your dates & guests\n3. Click 'Book Now'\n4. Pay securely — host confirms within 2 hours ✅",
  },
  {
    keys: ["same day", "last minute", "today", "instant"],
    answer:
      "Yes! Look for listings tagged 'Instant Booking' — those are confirmed immediately with no waiting for host approval. 🚀",
  },
  {
    keys: ["payment", "pay", "upi", "razorpay", "card", "how to pay", "gpay", "phonepe", "paytm"],
    answer:
      "We accept:\n• UPI (GPay, PhonePe, Paytm) — scan QR on the listing\n• All major debit/credit cards via Razorpay\n\nPayment is 100% encrypted and secure 🔒",
  },
  {
    keys: ["safe", "secure", "trust", "scam", "fraud"],
    answer:
      "HostTheGuest verifies all listings before they go live. Payments go through Razorpay — India's most trusted gateway. Your money is safe with us 🛡️",
  },
  {
    keys: ["refund", "money back", "return money", "get refund"],
    answer:
      "Refunds depend on each listing's cancellation policy (shown on the listing page). Once approved, refunds reach your account in 5–7 business days.",
  },
  {
    keys: ["cancel", "cancellation", "cancel booking", "how to cancel"],
    answer:
      "You can cancel anytime from your Guest Dashboard → My Bookings → Cancel.\n\nRefund amount depends on how early you cancel — check the listing's policy before booking.",
  },
  {
    keys: ["list my space", "become a host", "host my home", "earn money", "rent my room", "how to host", "i want to host"],
    answer:
      "Love that! Here's how:\n1. Click 'Become a Host' in the menu\n2. Fill in your space details & photos\n3. Submit for review\n4. We approve within 24 hours ✅\n\nYou set your own price and availability!",
  },
  {
    keys: ["earn", "income", "how much", "earnings", "profit", "money as host"],
    answer:
      "Hosts near wedding/event venues typically earn ₹2,000–₹8,000 per night depending on location and space type. You set your own price! 💰",
  },
  {
    keys: ["near venue", "event venue", "wedding", "marriage", "function", "ceremony", "close to venue"],
    answer:
      "Just enter your event venue name or address in the search bar. We'll show all stays sorted by distance so you can pick the closest one! 📍",
  },
  {
    keys: ["distance", "how far", "km", "radius", "nearby"],
    answer:
      "Each listing shows its exact distance from your searched venue. You can filter by radius (2 km, 5 km, 10 km) on the search page.",
  },
  {
    keys: ["check in", "check-in", "checkin", "arrival time", "when can i arrive"],
    answer:
      "Check-in time is set by each host — usually after 12:00 PM. You'll see the exact time on the listing page. Coordinate with your host for early check-in!",
  },
  {
    keys: ["check out", "checkout", "check-out", "departure", "leave"],
    answer:
      "Check-out is typically by 11:00 AM but each host sets their own time. It's shown on the listing page. Late check-out is at the host's discretion.",
  },
  {
    keys: ["wifi", "ac", "parking", "kitchen", "amenities", "facilities", "geyser"],
    answer:
      "Every listing shows its amenities clearly — WiFi, AC, parking, kitchen access, geyser, and more. Use the amenity filter on the search page to find exactly what you need! 🏠",
  },
  {
    keys: ["photo", "photos", "pictures", "see the place", "images"],
    answer:
      "Every listing has real photos uploaded by the host. Click any listing card to open the full photo gallery. 📸",
  },
  {
    keys: ["review", "rating", "feedback", "how are hosts rated"],
    answer:
      "Guests leave reviews after their stay — you can read them on every listing page. Ratings are based on cleanliness, accuracy, communication, and value.",
  },
  {
    keys: ["contact host", "talk to host", "message host", "reach host"],
    answer:
      "Once your booking is confirmed, you'll get the host's contact details. For questions before booking, the listing page has host info.",
  },
  {
    keys: ["price", "cost", "how much does it cost", "expensive", "cheap", "affordable"],
    answer:
      "Prices vary by listing — typically ₹800–₹5,000/night depending on space type and city. There's also a small platform fee (10%) shown at checkout.",
  },
  {
    keys: ["platform fee", "service fee", "charges", "extra charges"],
    answer:
      "We charge a 10% platform fee on top of the listing price. This is shown clearly before you confirm your booking — no hidden charges.",
  },
  {
    keys: ["contact", "support", "help", "reach you", "email", "phone", "whatsapp"],
    answer: `Need more help? Reach us at:\n📧 ${CONTACT_EMAIL}\n\nWe usually respond within a few hours!`,
  },
];

const QUICK_REPLIES = [
  { label: "📅 How to book",       text: "How to book a stay?" },
  { label: "💳 Payment & UPI",     text: "How do I pay?" },
  { label: "❌ Cancellation",       text: "How to cancel a booking?" },
  { label: "🏠 List my space",      text: "How do I become a host?" },
  { label: "📍 Stays near venue",   text: "Find stays near event venue" },
  { label: "📞 Contact support",    text: "Contact support" },
];

function getBotReply(text) {
  const q = text.toLowerCase().trim();
  for (const item of QA) {
    if (item.keys.some((k) => q.includes(k))) return item.answer;
  }
  return `I'm not sure about that one. For specific help please email us at 📧 ${CONTACT_EMAIL} — we'll get back to you shortly!`;
}

function now() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

let msgId = 0;
function mkMsg(from, text) {
  return { id: ++msgId, from, text, time: now() };
}

const WELCOME = mkMsg(
  "bot",
  "Hi! 👋 I'm the HostTheGuest assistant.\nI can help with bookings, payments, hosting, and more. What would you like to know?"
);

/* ── Component ───────────────────────────────────────────── */
export function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    setMessages((prev) => [...prev, mkMsg("user", trimmed)]);
    setTyping(true);
    try {
      let reply;
      if (AI_ENABLED) {
        const prompt = `${PLATFORM_CONTEXT}\n\nUser question: ${trimmed}`;
        reply = await aiGenerate(prompt);
      } else {
        await new Promise((r) => setTimeout(r, 700));
        reply = getBotReply(trimmed);
      }
      setMessages((prev) => [...prev, mkMsg("bot", reply.trim())]);
    } catch {
      setMessages((prev) => [...prev, mkMsg("bot", getBotReply(trimmed))]);
    } finally {
      setTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl lg:bottom-6 lg:right-6">

          {/* Header */}
          <div className="flex items-center gap-3 bg-brand-700 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">HostTheGuest Assistant</p>
              <p className="text-[11px] text-brand-200">Always here to help</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 overflow-y-auto px-4 py-4" style={{ maxHeight: 340 }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] ${m.from === "user" ? "" : "flex gap-2"}`}>
                  {m.from === "bot" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100">
                      <Bot className="h-3.5 w-3.5 text-brand-700" />
                    </div>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                        m.from === "user"
                          ? "rounded-tr-sm bg-brand-600 text-white"
                          : "rounded-tl-sm bg-stone-100 text-stone-800"
                      }`}
                    >
                      {m.text}
                    </div>
                    <p className={`mt-0.5 text-[10px] text-stone-400 ${m.from === "user" ? "text-right" : ""}`}>
                      {m.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100">
                    <Bot className="h-3.5 w-3.5 text-brand-700" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-1.5 border-t border-stone-100 px-3 py-2">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => sendMessage(q.text)}
                className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-stone-200 px-3 py-2.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a question…"
              className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating bubble ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-[4.5rem] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition-all hover:bg-brand-800 hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
