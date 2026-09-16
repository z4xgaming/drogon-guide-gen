const API = "/generate"; // vercel rewrite → /api/generate

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
  const prompt = $prompt.value.trim();
  if (!prompt) return setStatus("Pehle prompt likho.", "err");

  $btn.disabled = true;
  setStatus("⏳ Generating...");
  $out.textContent = "Wait karo...";

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.error || ("HTTP " + res.status));
    }

    // handle flexible response shapes
    const result =
      data.data?.output ||
      data.data?.text ||
      data.data?.result ||
      data.data?.message ||
      data.output ||
      data.text ||
      data.result ||
      data;

    $out.textContent =
      typeof result === "string" ? result : JSON.stringify(result, null, 2);

    setStatus("✅ Done" + (data.source ? " • " + data.source : ""), "ok");
  } catch (err) {
    $out.textContent = "❌ Error: " + err.message;
    setStatus("Fail ho gaya. Console check karo.", "err");
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
