# 🌾 Farmer Market Web Portal (விவசாய சந்தை வலைவாசல்)

A modern, full-stack marketplace connecting Farmers directly with Buyers, complete with dedicated Delivery Partner logistics, Admin management, MySQL database persistence, and an intelligent AI Voice Assistant.

---

## 📁 Project Architecture

The project is structured into two clean, self-contained directories:

```
farmer-market-portal/
├── backend/                       # Node.js + Express REST API Server
│   ├── config/                    # MySQL database connection pool & schemas
│   ├── controllers/               # Auth, Orders, Products, Receipt PDF, Voice controllers
│   ├── middleware/                # JWT verification & role authorization
│   ├── models/                    # Data models & validation
│   ├── routes/                    # API endpoints (/api/auth, /api/orders, /api/products)
│   ├── store/                     # Persistent storage helpers
│   ├── server.js                  # Express backend entry point (Port 3001)
│   ├── package.json               # Backend dependencies
│   └── .env                       # Backend secrets, DB credentials, AI API keys
│
├── frontend/                      # React 18 + Vite + Tailwind CSS Single-Page App
│   ├── public/                    # Static assets & images
│   ├── src/                       # React components, pages, contexts, hooks, utilities
│   ├── dist/                      # Production build distribution
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration with /api proxy to Port 3001
│   ├── tailwind.config.js         # Tailwind theme & color tokens
│   ├── postcss.config.js          # PostCSS configuration
│   ├── package.json               # Frontend dependencies
│   └── .env                       # Client environment variables (VITE_GOOGLE_CLIENT_ID)
│
├── farmer_market.sql             # MySQL database schema & sample data dump
├── package.json                  # Root runner scripts
└── README.md                     # Documentation
```

---

## 🚀 How to Run

### 1. Database (MySQL via XAMPP)
- Start MySQL in **XAMPP Control Panel** (or `mysqld` service on port `3306`).
- Ensure the database `farmer_market` exists. The server auto-creates all necessary tables (`users`, `products`, `orders`) upon first start.

---

### 2. Running from Root (Convenience Scripts)

You can run commands directly from the project root:

```bash
# Start Backend server (Port 3001)
npm run start
# or
npm run dev:backend

# Start Frontend Vite dev server (Port 5173)
npm run dev:frontend

# Build Frontend for production
npm run build
```

---

### 3. Running Frontend and Backend Independently

#### Option A: Backend Only
```bash
cd backend
npm install    # (First time only)
npm start      # Starts on http://localhost:3001
```

#### Option B: Frontend Only
```bash
cd frontend
npm install    # (First time only)
npm run dev    # Starts on http://localhost:5173
```

---

## 🔐 Environment Variables (`.env`)

- **`backend/.env`**:
  - `PORT=3001`
  - `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_USER=root`, `DB_PASSWORD=`, `DB_NAME=farmer_market`
  - `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`
  - `GOOGLE_CLIENT_ID`
- **`frontend/.env`**:
  - `VITE_GOOGLE_CLIENT_ID` (client-safe for Google Sign-In button)

---

## 👥 User Roles & Login

- **Buyer**: Browse organic crops, add to cart, place orders, download PDF receipts.
- **Farmer**: List produce, manage inventory, accept/reject buyer orders, update harvest status.
- **Delivery Partner**: View assigned logistics orders, confirm pickup, update delivery milestones.
- **Admin**: Platform oversight, user management, order auditing.
