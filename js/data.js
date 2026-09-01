/* ==========================================================================
   Seed data + tiny persistence layer (localStorage)
   ========================================================================== */

const CATEGORIES = [
  { id: "vegetable", label: "Vegetables", icon: "🥬" },
  { id: "fruit", label: "Fruits", icon: "🍉" },
  { id: "grain", label: "Grains & Pulses", icon: "🌾" },
  { id: "dairy", label: "Dairy", icon: "🥛" },
  { id: "spice", label: "Spices", icon: "🌶️" },
];

const ICONS = {
  vegetable: ["🥬", "🥕", "🍆", "🥔", "🍅", "🌽"],
  fruit: ["🍉", "🍌", "🥭", "🍇", "🍊", "🍎"],
  grain: ["🌾", "🌰", "🫘"],
  dairy: ["🥛", "🧀", "🧈"],
  spice: ["🌶️", "🧄", "🧅"],
};

const SEED_PRODUCTS = [
  { id: "p1", name: "Country Tomatoes", category: "vegetable", price: 32, unit: "kg", farmer: "Muthu Kumar", village: "Sivakasi", stock: 120, icon: "🍅", aiVerified: true },
  { id: "p2", name: "Organic Brinjal", category: "vegetable", price: 28, unit: "kg", farmer: "Lakshmi Devi", village: "Rajapalayam", stock: 65, icon: "🍆", aiVerified: true },
  { id: "p3", name: "Fresh Ladies Finger", category: "vegetable", price: 40, unit: "kg", farmer: "Karthik R", village: "Virudhunagar", stock: 8, icon: "🌽", aiVerified: false },
  { id: "p4", name: "Alphonso Mango", category: "fruit", price: 180, unit: "dozen", farmer: "Selvam S", village: "Sivakasi", stock: 40, icon: "🥭", aiVerified: true },
  { id: "p5", name: "Sweet Banana", category: "fruit", price: 55, unit: "dozen", farmer: "Meena P", village: "Sattur", stock: 90, icon: "🍌", aiVerified: true },
  { id: "p6", name: "Ponni Raw Rice", category: "grain", price: 62, unit: "kg", farmer: "Ravi Shankar", village: "Aruppukottai", stock: 300, icon: "🌾", aiVerified: true },
  { id: "p7", name: "Toor Dal (Farm Fresh)", category: "grain", price: 148, unit: "kg", farmer: "Vasanthi K", village: "Sivakasi", stock: 55, icon: "🫘", aiVerified: false },
  { id: "p8", name: "A2 Cow Milk", category: "dairy", price: 70, unit: "litre", farmer: "Gopal Farms", village: "Thiruthangal", stock: 25, icon: "🥛", aiVerified: true },
  { id: "p9", name: "Country Chilli", category: "spice", price: 210, unit: "kg", farmer: "Anitha M", village: "Sattur", stock: 6, icon: "🌶️", aiVerified: false },
  { id: "p10", name: "Fresh Garlic", category: "spice", price: 95, unit: "kg", farmer: "Muthu Kumar", village: "Sivakasi", stock: 70, icon: "🧄", aiVerified: true },
];

// baseline market-rate table used by the AI price advisor (₹ per kg/unit)
const MARKET_BASELINE = {
  vegetable: 30,
  fruit: 60,
  grain: 65,
  dairy: 65,
  spice: 160,
};

const Store = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage unavailable, fail silently */
    }
  },
};

function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function currency(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
