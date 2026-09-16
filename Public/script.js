// ========== DIRECT API SETUP ==========
const API_URL = "https://drogon-guist-gen-ok3.vercel.app/generate";

// Agar API ko prompt ke alawa kuch aur chahiye to yahan add karo
const PAYLOAD_KEY = "prompt";   // "prompt" / "text" / "query" / "input" / "message"
const PAYLOAD_EXTRA = {};        // {"model":"gpt", "lang":"hi"} jaisa kuch

// ======================================

const $prompt = document.getElementById("prompt");
const $btn    = document.getElementById("btn");
const $clear  = document.getElementById("clear");
const $out    = document.getElementById("output");
const $status = document.getElementById("status");

function setStatus(msg, type = "") {
  $status.textContent = msg;
  $status.className = "status " + type;
}

async function generate() {
  const value = $prompt.value.trim();
  if (!value) return setStatus("Pehle prompt likho.", "err");

  $btn.disabled = true;
  setStatus("⏳ Generating...");
  $out.textContent = "Wait karo...";

  try {
    const body = { [PAYLOAD_KEY]: value, ...PAYLOAD_EXTRA };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = raw; }

    if (!res.ok) throw new Error("HTTP " + res.status + " → " + raw.slice(0, 200));

    const result =
      (data && (data.output || data.text || data.result || data.message || data.response)) || data;

    $out.textContent =
      typeof result === "string" ? result : JSON.stringify(result, null, 2);

    setStatus("✅ Done", "ok");
  } catch (err) {
    $out.textContent = "❌ " + err.message;
    setStatus("Fail", "err");
    console.error(err);
  } finally {
    $btn.disabled = false;
  }
}

$btn.addEventListener("click", generate);
$clear.addEventListener("click", () => {
  $prompt.value = "";
  $out.textContent = "Yahan output aayega...";
  setStatus("");
});
$prompt.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate();
});
