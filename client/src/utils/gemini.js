const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export async function geminiGenerate(prompt) {
  if (!API_KEY) throw new Error("VITE_GROQ_API_KEY not set");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Groq error:", err);
    throw new Error(err?.error?.message || "Groq API error");
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export function buildListingDescriptionPrompt({ type, city, state, maxGuests, beds, bathrooms, amenities, nearbyVenueArea }) {
  const amenityList = amenities?.length ? amenities.join(", ") : "basic amenities";
  const venue = nearbyVenueArea ? `Located near: ${nearbyVenueArea}.` : "";
  return `Write a warm, inviting listing description for a property on HostTheGuest — an Indian platform for guests attending weddings and events.

Property details:
- Type: ${type}
- Location: ${city || "India"}${state ? `, ${state}` : ""}
- Capacity: ${maxGuests} guests, ${beds} bed(s), ${bathrooms} bathroom(s)
- Amenities: ${amenityList}
${venue}

Instructions:
- Write 3-4 sentences only
- Sound warm and welcoming, not robotic
- Mention it's great for wedding/event guests if relevant
- Highlight the best 2-3 amenities naturally
- Do NOT start with "Welcome to" or "This is"
- Keep under 120 words
- Write in English`;
}
