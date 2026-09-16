const APIS = [
  "https://drogon-guist-gen-ok3.vercel.app/generate",
  "https://drogon-guist-gen-ok1.vercel.app/generate",
  "https://drogon-guist-gen-ok.vercel.app/generate",
  "https://drogon-guist-gen.vercel.app/generate"
];

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const body = req.body || {};
  const errors = [];

  for (const url of APIS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!r.ok) {
        errors.push({ url, status: r.status });
        continue;
      }

      const data = await r.json();
      return res.status(200).json({ success: true, source: url, data });
    } catch (e) {
      errors.push({ url, error: e.message });
    }
  }

  return res.status(502).json({
    success: false,
    error: "All upstream APIs failed",
    details: errors
  });
}
