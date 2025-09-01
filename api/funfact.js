// /api/funfact.js
async function readJson(req) {
    if (req.body && typeof req.body === "object") return req.body; // Next.js case
    let raw = "";
    for await (const chunk of req) raw += chunk;                    // Plain Vercel case
    try { return JSON.parse(raw || "{}"); } catch { return {}; }
  }
  
  export default async function handler(req, res) {
    try {
      if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  
      const API_KEY = process.env.API_KEY;            // <-- name must match Vercel env var
      if (!API_KEY) return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
  
      const { about = "", name = "", stylePrompt = "" } = await readJson(req);
      if (!about.trim()) return res.status(400).json({ error: "`about` required" });
  
      const basePrompt = `You craft one single-sentence fun fact that feels formal yet makes readers quietly giggle.
  Rules:
  - Max 22 words, plain text, no emojis.
  - We are students of AKGEC ghaziabad so keep the humor that way
  - must be funny but subtle and clever.
  - Use info from "About" to anchor the joke.
  - Avoid exaggeration and avoid repeating "fun fact".
  - Return ONLY the final sentence.`;
  
      const full = `${basePrompt}
  Name: ${name || "Member"}
  About: ${about.slice(0, 600)}
  ${stylePrompt ? `Extra instruction: ${stylePrompt}` : ""}`;
  
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: full }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 60 }
          })
        }
      );
  
      if (!r.ok) {
        const detail = await r.text();
        return res.status(500).json({ error: "LLM call failed", status: r.status, detail: detail.slice(0, 400) });
      }
  
      const data = await r.json();
      const funFact = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        || "A carefully humorous observation appears to have taken a short sabbatical.";
      return res.status(200).json({ funFact });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  