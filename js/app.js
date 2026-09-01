const { useState, useEffect, useRef, useMemo } = React;

/* ---------------------------------------------------------------------- */
/* Toasts                                                                  */
/* ---------------------------------------------------------------------- */
function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>{t.text}</div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Top navigation                                                         */
/* ---------------------------------------------------------------------- */
function Topbar({ page, setPage, user, cartCount, onCartClick, onAuthClick, onLogout }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "market", label: "Marketplace" },
    { id: "dashboard", label: "Farmer Dashboard" },
    { id: "about", label: "How it Works" },
  ];
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand" onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
          <div className="brand-mark">🌾</div>
          <div>
            <div className="brand-name">AnnaSanthai</div>
            <div className="brand-tag">Farm to Table, Direct</div>
          </div>
        </div>

        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.id}>
              <button className={page === l.id ? "active" : ""} onClick={() => setPage(l.id)}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="topbar-actions">
          <button className="icon-btn" onClick={onCartClick} aria-label="Cart">
            🧺
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
          {user ? (
            <>
              <span style={{ fontSize: ".85rem", color: "var(--ink-soft)" }}>
                Hi, {user.name.split(" ")[0]}
              </span>
              <button className="btn ghost small" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <button className="btn small" onClick={onAuthClick}>Log in</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Hero                                                                    */
/* ---------------------------------------------------------------------- */
function Hero({ setPage, stats }) {
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div>
          <span className="hero-eyebrow">AI-assisted farmer marketplace</span>
          <h1>Fresh harvest, <em>fair price</em>, straight from the field.</h1>
          <p className="lede">
            AnnaSanthai connects farmers directly with buyers — no middlemen, no
            guesswork. Our AI price advisor helps farmers list fairly, and
            FarmMate AI answers questions for everyone, day or night.
          </p>
          <div className="hero-actions">
            <button className="btn marigold" onClick={() => setPage("market")}>Browse Marketplace</button>
            <button className="btn ghost" style={{ borderColor: "var(--wheat)", color: "var(--wheat)" }} onClick={() => setPage("dashboard")}>
              Sell Your Produce
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><b>{stats.farmers}+</b><span>Farmers Onboard</span></div>
            <div className="hero-stat"><b>{stats.products}</b><span>Live Listings</span></div>
            <div className="hero-stat"><b>Zero</b><span>Middlemen</span></div>
          </div>
        </div>

        <div className="hero-card">
          <span className="stamp">✦ AI Verified Price</span>
          <h3>Country Tomatoes</h3>
          <div className="card-farmer">Muthu Kumar · Sivakasi</div>
          <div className="hero-card-row"><span>Market baseline</span><b>₹30/kg</b></div>
          <div className="hero-card-row"><span>AI suggested range</span><b>₹29 – ₹34/kg</b></div>
          <div className="hero-card-row"><span>Listed price</span><b style={{ color: "var(--leaf-dark)" }}>₹32/kg</b></div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* How it works                                                           */
/* ---------------------------------------------------------------------- */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Farmer lists produce", body: "Add crop, quantity and photos. Our AI advisor instantly suggests a fair price band based on market rate and stock." },
    { n: "02", title: "Buyers browse & order", body: "Buyers search fresh stock by category or village, add to their basket, and check out in a few taps." },
    { n: "03", title: "Ask FarmMate AI anytime", body: "Stuck on storage, pricing, or picking produce? The built-in AI chat assistant is one click away." },
  ];
  return (
    <section className="section" id="about">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Process</span>
            <h2>How AnnaSanthai works</h2>
          </div>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <div className="step-card" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Product card + grid                                                    */
/* ---------------------------------------------------------------------- */
function ProductCard({ p, onAdd }) {
  const low = p.stock < 15;
  return (
    <div className="card">
      {p.aiVerified && <div className="ai-stamp">AI Verified</div>}
      <div className="card-media">{p.icon}</div>
      <div className="card-body">
        <h4>{p.name}</h4>
        <div className="card-farmer">{p.farmer} · {p.village}</div>
        <span className={"stock-tag" + (low ? " low" : "")}>
          {low ? `Only ${p.stock} left` : `${p.stock} ${p.unit} in stock`}
        </span>
        <div className="card-price-row">
          <span className="card-price">{currency(p.price)}</span>
          <span className="card-unit">/ {p.unit}</span>
        </div>
        <div className="card-actions">
          <button className="btn leaf small block" onClick={() => onAdd(p)}>Add to Basket</button>
        </div>
      </div>
    </div>
  );
}

function Marketplace({ products, onAdd }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = cat === "all" || p.category === cat;
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.village.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [products, query, cat]);

  return (
    <section className="section" id="market">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Marketplace</span>
            <h2>Fresh listings today</h2>
          </div>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search produce or village…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={"chip" + (cat === "all" ? " active" : "")} onClick={() => setCat("all")}>All</button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={"chip" + (cat === c.id ? " active" : "")}
              onClick={() => setCat(c.id)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">🌱</div>
            <p>No produce matches that search yet. Try another crop or village.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} onAdd={onAdd} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Farmer dashboard — includes the AI Price Advisor                       */
/* ---------------------------------------------------------------------- */
function AddProductForm({ user, onCreate, pushToast }) {
  const [form, setForm] = useState({
    name: "", category: "vegetable", price: "", unit: "kg", stock: "",
  });
  const [suggestion, setSuggestion] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const runAdvisor = () => {
    if (!form.stock) {
      pushToast("Enter stock quantity first so the AI can factor it in.");
      return;
    }
    const s = AiPriceAdvisor.suggest({ category: form.category, stock: form.stock });
    setSuggestion(s);
  };

  const applySuggestion = () => {
    if (suggestion) update("price", suggestion.mid);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      pushToast("Please fill in produce name, price and stock.");
      return;
    }
    const icons = ICONS[form.category] || ["🌿"];
    onCreate({
      id: uid("p"),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      unit: form.unit,
      stock: Number(form.stock),
      farmer: user ? user.name : "Guest Farmer",
      village: user ? user.village || "Sivakasi" : "Sivakasi",
      icon: icons[Math.floor(Math.random() * icons.length)],
      aiVerified: !!suggestion,
    });
    setForm({ name: "", category: "vegetable", price: "", unit: "kg", stock: "" });
    setSuggestion(null);
    pushToast(`"${form.name}" listed on the marketplace ✅`);
  };

  return (
    <div className="panel">
      <h3>List new produce</h3>
      <form onSubmit={submit}>
        <div className="field">
          <label>Produce name</label>
          <input type="text" placeholder="e.g. Country Tomatoes" value={form.name}
            onChange={(e) => update("name", e.target.value)} />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => { update("category", e.target.value); setSuggestion(null); }}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Unit</label>
            <select value={form.unit} onChange={(e) => update("unit", e.target.value)}>
              {["kg", "litre", "dozen", "bag"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Stock available</label>
            <input type="number" min="1" placeholder="e.g. 50" value={form.stock}
              onChange={(e) => { update("stock", e.target.value); setSuggestion(null); }} />
          </div>
          <div className="field">
            <label>Your price (₹)</label>
            <input type="number" min="1" placeholder="e.g. 32" value={form.price}
              onChange={(e) => update("price", e.target.value)} />
          </div>
        </div>

        <button type="button" className="btn ghost small" onClick={runAdvisor}>
          ✦ Ask AI for a fair price
        </button>

        {suggestion && (
          <div className="ai-suggest-box">
            <div className="ai-title">✦ AI Price Advisor</div>
            <div className="ai-price-figure">
              {currency(suggestion.low)} – {currency(suggestion.high)}
            </div>
            <p>{suggestion.note}</p>
            <button type="button" className="mini-btn" style={{ marginTop: 10 }} onClick={applySuggestion}>
              Use suggested price ({currency(suggestion.mid)})
            </button>
          </div>
        )}

        <button className="btn leaf block" style={{ marginTop: 6 }} type="submit">
          Publish listing
        </button>
      </form>
    </div>
  );
}

function Dashboard({ user, products, onCreate, onRemove, pushToast }) {
  const mine = user ? products.filter((p) => p.farmer === user.name) : products.slice(0, 4);
  return (
    <section className="section" id="dashboard">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Farmer dashboard</span>
            <h2>Manage your produce</h2>
          </div>
        </div>

        <div className="dash-layout">
          <AddProductForm user={user} onCreate={onCreate} pushToast={pushToast} />

          <div className="panel">
            <h3>{user ? `${user.name}'s listings` : "Sample listings"}</h3>
            {mine.length === 0 ? (
              <div className="empty-state">
                <div className="glyph">🧺</div>
                <p>No listings yet — use the form to publish your first crop.</p>
              </div>
            ) : (
              <table className="listing-table">
                <thead>
                  <tr>
                    <th>Produce</th><th>Price</th><th>Stock</th><th>AI</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((p) => (
                    <tr key={p.id}>
                      <td>{p.icon} {p.name}</td>
                      <td className="card-price" style={{ fontSize: ".85rem" }}>{currency(p.price)}/{p.unit}</td>
                      <td>{p.stock}</td>
                      <td>{p.aiVerified ? "✅" : "—"}</td>
                      <td><button className="mini-btn danger" onClick={() => onRemove(p.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Cart drawer                                                            */
/* ---------------------------------------------------------------------- */
function CartDrawer({ cart, onClose, onQty, onRemove, onCheckout }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div className="drawer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer">
        <div className="drawer-head">
          <h3>Your Basket</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="glyph">🧺</div>
              <p>Your basket is empty. Add some fresh produce from the marketplace!</p>
            </div>
          ) : (
            cart.map((i) => (
              <div className="cart-item" key={i.id}>
                <div className="cart-item-media">{i.icon}</div>
                <div className="cart-item-info">
                  <h5>{i.name}</h5>
                  <span style={{ fontSize: ".78rem", color: "var(--ink-soft)" }}>
                    {currency(i.price)} / {i.unit}
                  </span>
                </div>
                <div className="qty-controls">
                  <button onClick={() => onQty(i.id, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => onQty(i.id, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-total-row"><span>Total</span><b>{currency(total)}</b></div>
            <button className="btn marigold block" onClick={onCheckout}>Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Auth modal (mock, localStorage-backed)                                 */
/* ---------------------------------------------------------------------- */
function AuthModal({ onClose, onLogin, pushToast }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", village: "" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      pushToast("Please enter your name and email.");
      return;
    }
    onLogin({ name: form.name, email: form.email, village: form.village || "Sivakasi", role });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{mode === "login" ? "Welcome back" : "Create your account"}</h3>
        <p className="sub">Join AnnaSanthai as a farmer or a buyer.</p>

        <div className="role-toggle">
          <button type="button" className={role === "buyer" ? "active" : ""} onClick={() => setRole("buyer")}>🧑‍🌾 Buyer</button>
          <button type="button" className={role === "farmer" ? "active" : ""} onClick={() => setRole("farmer")}>🌾 Farmer</button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Village / Town</label>
            <input type="text" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder="e.g. Sivakasi" />
          </div>
          <button className="btn leaf block" type="submit">
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <div className="tab-switch">
          {mode === "login" ? (
            <>New here? <button onClick={() => setMode("signup")}>Create an account</button></>
          ) : (
            <>Already registered? <button onClick={() => setMode("login")}>Log in</button></>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* FarmMate AI chat widget                                                */
/* ---------------------------------------------------------------------- */
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [key, setKeyState] = useState(FarmMateAI.getKey());
  const [keyInput, setKeyInput] = useState("");
  const [history, setHistory] = useState([
    { role: "assistant", text: "Vanakkam! I'm FarmMate AI 🌾 Ask me about crop pricing, storage, or what's in season." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history, loading, open]);

  const saveKey = () => {
    if (!keyInput.trim()) return;
    FarmMateAI.setKey(keyInput);
    setKeyState(keyInput.trim());
    setKeyInput("");
  };

  const removeKey = () => {
    FarmMateAI.clearKey();
    setKeyState("");
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const nextHistory = [...history, { role: "user", text }];
    setHistory(nextHistory);
    setLoading(true);
    try {
      const reply = await FarmMateAI.send(history, text);
      setHistory((h) => [...h, { role: "assistant", text: reply }]);
    } catch (err) {
      let msg = "Something went wrong reaching the AI service.";
      if (String(err.message).includes("NO_KEY")) msg = "Add your Anthropic API key above to start chatting.";
      else if (String(err.message).startsWith("API_ERROR")) msg = "The AI service returned an error — check your API key and try again.";
      setHistory((h) => [...h, { role: "assistant", text: msg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Open FarmMate AI chat">
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div>
              <h4>FarmMate AI</h4>
              <span>Powered by Claude</span>
            </div>
          </div>

          {!key && (
            <div className="chat-key-setup">
              This assistant uses the Anthropic API. Paste your own API key to
              enable live answers (stored only in your browser).
              <input
                type="password"
                placeholder="sk-ant-..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <div className="save-row">
                <button className="btn small leaf" type="button" onClick={saveKey}>Save key</button>
              </div>
            </div>
          )}

          {key && (
            <div className="chat-key-setup" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>✅ API key connected</span>
              <button className="mini-btn danger" onClick={removeKey}>Remove</button>
            </div>
          )}

          <div className="chat-body" ref={bodyRef}>
            {history.map((m, idx) => (
              <div key={idx} className={"msg " + (m.role === "user" ? "user" : m.isError ? "err" : "bot")}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="msg bot typing-dots"><span></span><span></span><span></span></div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Ask about crops, pricing, storage…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Footer                                                                  */
/* ---------------------------------------------------------------------- */
function Footer() {
  return (
    <footer>
      <div className="wrap footer-inner">
        <div>
          <h4>🌾 AnnaSanthai</h4>
          <p style={{ maxWidth: "32ch", fontSize: ".85rem" }}>
            A farmer-first market portal built with React, connecting growers
            in and around Sivakasi directly with buyers, backed by AI pricing
            and support.
          </p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            <div>Marketplace</div>
            <div>Farmer Dashboard</div>
            <div>How it Works</div>
          </div>
          <div>
            <h4>AI Tools</h4>
            <div>FarmMate AI Chat</div>
            <div>AI Price Advisor</div>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 AnnaSanthai. Student project demo.</span>
        <span>Built with React · HTML · CSS · JS</span>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------------- */
/* Root App                                                                */
/* ---------------------------------------------------------------------- */
function App() {
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState(() => Store.read("annasanthai_products", SEED_PRODUCTS));
  const [cart, setCart] = useState(() => Store.read("annasanthai_cart", []));
  const [user, setUser] = useState(() => Store.read("annasanthai_user", null));
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => Store.write("annasanthai_products", products), [products]);
  useEffect(() => Store.write("annasanthai_cart", cart), [cart]);
  useEffect(() => Store.write("annasanthai_user", user), [user]);

  const pushToast = (text) => {
    const id = uid("t");
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const addToCart = (p) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === p.id);
      if (existing) {
        return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { ...p, qty: 1 }];
    });
    pushToast(`${p.name} added to your basket 🧺`);
  };

  const changeQty = (id, delta) => {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const checkout = () => {
    pushToast("Order placed! The farmer will confirm shortly. 🌾");
    setCart([]);
    setShowCart(false);
  };

  const createProduct = (p) => setProducts((ps) => [p, ...ps]);
  const removeProduct = (id) => setProducts((ps) => ps.filter((p) => p.id !== id));

  const handleLogin = (u) => {
    setUser(u);
    setShowAuth(false);
    pushToast(`Welcome, ${u.name}! Logged in as ${u.role}.`);
  };
  const handleLogout = () => {
    setUser(null);
    pushToast("Logged out.");
  };

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const stats = { farmers: new Set(products.map((p) => p.farmer)).size + 40, products: products.length };

  return (
    <div className="app">
      <Topbar
        page={page} setPage={setPage} user={user} cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        onAuthClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <main>
        {page === "home" && (
          <>
            <Hero setPage={setPage} stats={stats} />
            <HowItWorks />
            <div className="section tint">
              <div className="wrap">
                <div className="section-head">
                  <div>
                    <span className="eyebrow">Marketplace preview</span>
                    <h2>Today's fresh picks</h2>
                  </div>
                  <button className="btn ghost" onClick={() => setPage("market")}>See all →</button>
                </div>
                <div className="grid">
                  {products.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {page === "market" && <Marketplace products={products} onAdd={addToCart} />}

        {page === "dashboard" && (
          <Dashboard user={user} products={products} onCreate={createProduct} onRemove={removeProduct} pushToast={pushToast} />
        )}

        {page === "about" && (
          <>
            <HowItWorks />
            <div className="section">
              <div className="wrap" style={{ maxWidth: 760 }}>
                <h2 style={{ marginBottom: 16 }}>About the AI tools</h2>
                <p style={{ marginBottom: 14, color: "var(--ink-soft)" }}>
                  <b>AI Price Advisor</b> runs instantly on-device: it blends a category
                  market baseline, seasonal timing and current stock level to suggest a
                  fair price band for a new listing, so first-time sellers aren't guessing.
                </p>
                <p style={{ color: "var(--ink-soft)" }}>
                  <b>FarmMate AI</b> (bottom-right chat bubble) is a real generative AI
                  assistant powered by Anthropic's Claude models. Paste your own API key
                  to ask it about crop storage, pricing trends, or what's in season.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {showCart && (
        <CartDrawer
          cart={cart} onClose={() => setShowCart(false)}
          onQty={changeQty} onCheckout={checkout}
        />
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} pushToast={pushToast} />}

      <ChatWidget />
      <ToastStack toasts={toasts} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
