/* ==========================================================================
   AI TOOLS
   1. AiPriceAdvisor  – on-device heuristic "AI" that recommends a fair
      selling price band for a new listing, using category baselines,
      seasonality and stock pressure. Runs instantly, no API key needed.
   2. FarmMateAI      – a real generative-AI chat assistant. It calls the
      Anthropic Messages API directly from the browser using a key the
      farmer/buyer pastes in (stored only in localStorage on their device).
      NOTE: calling a model API straight from client-side JS is convenient
      for a student/demo project, but a production app should proxy this
      call through a backend so the API key is never exposed in the browser.
   ========================================================================== */

const AiPriceAdvisor = {
  /**
   * Suggests a price range for a product listing.
   * Heuristic factors:
   *  - category baseline market rate
   *  - stock level (more stock -> encourage slightly lower price to move volume)
   *  - simple "seasonality" nudge based on current month
   */
  suggest({ category, stock }) {
    const base = MARKET_BASELINE[category] || 50;
    const month = new Date().getMonth(); // 0-11
    // crude seasonal wave: prices firmer in summer months (Mar-Jun) for veg/fruit
    const seasonalFactor = [0, 1, 2, 3, 4, 5].includes(month) ? 1.06 : 0.98;
    const stockN = Number(stock) || 0;
    const stockFactor = stockN > 100 ? 0.93 : stockN < 15 ? 1.1 : 1.0;

    const mid = Math.round(base * seasonalFactor * stockFactor);
    const low = Math.round(mid * 0.9);
    const high = Math.round(mid * 1.12);

    let note;
    if (stockN < 15) {
      note = "Low stock detected — buyers usually accept a small premium for scarce, freshly-harvested batches.";
    } else if (stockN > 100) {
      note = "High stock on hand — pricing near the lower end helps you sell the batch faster before it ages.";
    } else {
      note = "Stock level is healthy — this range balances a fair return with a competitive market price.";
    }

    return { low, mid, high, note };
  },
};

/* -------------------------------------------------------------------------
   FarmMateAI — thin wrapper around the Anthropic Messages API
   ------------------------------------------------------------------------- */
const FarmMateAI = {
  KEY_STORAGE: "annasanthai_ai_key",

  getKey() {
    return localStorage.getItem(this.KEY_STORAGE) || "";
  },
  setKey(key) {
    localStorage.setItem(this.KEY_STORAGE, key.trim());
  },
  clearKey() {
    localStorage.removeItem(this.KEY_STORAGE);
  },

  async send(history, userMessage) {
    const key = this.getKey();
    if (!key) throw new Error("NO_KEY");

    const systemPrompt =
      "You are FarmMate AI, a friendly assistant embedded inside AnnaSanthai, " +
      "a farmer-to-buyer market portal in Tamil Nadu, India. Help farmers with " +
      "crop pricing guidance, harvest timing, storage tips, and help buyers with " +
      "produce selection, seasonal availability, and recipes. Keep answers short " +
      "(3-5 sentences), practical, and friendly. You may mix in simple Tamil " +
      "words where natural, but keep it understandable to English readers.";

    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: userMessage },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error("API_ERROR:" + res.status + ":" + errBody.slice(0, 200));
    }

    const data = await res.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    return textBlock ? textBlock.text : "(no response)";
  },
};
