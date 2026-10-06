import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initMySQL } from './config/mysql.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { handleVoiceQuery } from './controllers/voiceController.js';
import { syncMarketPrices } from './services/marketPriceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory or parent directories
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.resolve(__dirname, '.env'));
  } catch (e) {
    try {
      process.loadEnvFile(path.resolve(__dirname, '../.env'));
    } catch (e2) {}
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to Database (MySQL with auto-table generation and resilient fallback)
initMySQL().then(() => {
  syncMarketPrices().catch((err) => console.warn('Market price sync notice:', err.message));
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Health & Status check endpoint
app.get('/api/health', (req, res) => {
  const geminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const openaiConfigured = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');
  const groqConfigured = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');

  res.json({
    status: 'online',
    service: 'Farmer Market Web Portal Backend',
    database: 'MySQL (127.0.0.1:3306/farmer_market) Active',
    providers: {
      gemini: geminiConfigured,
      openai: openaiConfigured,
      groq: groqConfigured,
      intelligentEngine: true,
    },
  });
});

// Dynamic AI Voice Query Endpoint (Real MySQL Database Data Integration)
app.post('/api/voice/query', handleVoiceQuery);

// Serve frontend static build in production
const distPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Farmer Market Portal API Online');
    }
  });
});

// Start standalone Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌾 Farmer Market Portal Backend running securely on http://localhost:${PORT}`);
  });
}

export default app;
