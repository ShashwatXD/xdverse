// api/funfact-gemini.js
export default async function handler(req, res) {
    try {
      if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  
      const { about = "", name = "", stylePrompt = "" } = req.body || {};
      if (!about) return res.status(400).json({ error: "`about` required" });
  
      const basePrompt = `You craft one single-sentence fun fact that feels formal yet makes readers quietly giggle.
  Rules:
  - Max 22 words, plain text, no emojis.
  - Tone: courteously witty, never snarky.
  - Use info from "About" to anchor the joke.
  - Avoid exaggeration and avoid repeating "fun fact".
  - Return ONLY the final sentence.`;
  
      const full = `${basePrompt}
  Name: ${name || "Member"}
  About: ${about.slice(0, 600)}
  ${stylePrompt ? `Extra instruction: ${stylePrompt}` : ""}`;
  
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCW_ROKypKmJTSZ5YDcIU4bUf9dtXPx-1s`,
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
        const t = await r.text();
        return res.status(500).json({ error: "LLM call failed", detail: t });
      }
  
      const data = await r.json();
      const funFact =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "A carefully humorous observation appears to have taken a short sabbatical.";
      return res.status(200).json({ funFact });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  