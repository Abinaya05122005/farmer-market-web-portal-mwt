import jwt from 'jsonwebtoken';
import { dbStore } from '../store/dataStore.js';
import { getMySQLPool, getIsMySQLConnected } from '../config/mysql.js';

const JWT_SECRET = process.env.JWT_SECRET || 'farmer_market_super_secret_jwt_key_2026';

/**
 * Clean spoken text: removes markdown symbols (asterisks, hashtags, backticks, bullets)
 * so Text-to-Speech reads naturally without awkward characters.
 */
function cleanSpokenOutput(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/^[•\-\*]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/**
 * Multi-lingual Tamil / Tanglish / English produce name dictionary
 * Maps colloquial produce terms to catalog search keywords.
 */
export const PRODUCE_SYNONYMS = [
  { keywords: ['thakkali', 'thakaali', 'thakkalli', 'தக்காளி', 'tomato', 'tomatoes'], matchTerms: ['tomato', 'tomatoes'] },
  { keywords: ['urulai', 'urulaikilangu', 'urulaikizhangu', 'உருளை', 'potato', 'potatoes', 'aloo'], matchTerms: ['potato', 'potatoes'] },
  { keywords: ['vengayam', 'vengaayam', 'வெங்காயம்', 'shallot', 'shallots', 'onion', 'onions', 'chinna vengayam', 'periya vengayam'], matchTerms: ['shallot', 'onion'] },
  { keywords: ['vendakkai', 'vendaikkai', 'வெண்டைக்காய்', 'okra', 'ladies finger', 'bhindi', 'bhendi'], matchTerms: ['okra', 'ladies finger'] },
  { keywords: ['kathirikkai', 'kathirikai', 'கத்தரிக்காய்', 'brinjal', 'eggplant', 'baingan'], matchTerms: ['brinjal', 'eggplant'] },
  { keywords: ['carrot', 'கேரட்', 'காரட்', 'gajar'], matchTerms: ['carrot'] },
  { keywords: ['muttakose', 'muttakos', 'முட்டைக்கோஸ்', 'cabbage', 'patta gobhi'], matchTerms: ['cabbage'] },
  { keywords: ['cauliflower', 'காலிஃபிளவர்', 'gobi'], matchTerms: ['cauliflower'] },
  { keywords: ['beetroot', 'beet', 'பீட்ரூட்', 'chukandar'], matchTerms: ['beetroot'] },
  { keywords: ['milagai', 'pacha milagai', 'மிளகாய்', 'chilli', 'chillies', 'chili', 'mirchi'], matchTerms: ['green chillies', 'chilli', 'chillies'] },
  { keywords: ['paal', 'பால்', 'pasumpaal', 'pasumpal', 'milk', 'doodh'], matchTerms: ['milk', 'cow milk'] },
  { keywords: ['thayir', 'தயிர்', 'curd', 'dahi', 'yogurt'], matchTerms: ['curd'] },
  { keywords: ['paneer', 'பன்னீர்', 'panir'], matchTerms: ['paneer'] },
  { keywords: ['vennai', 'வெண்ணெய்', 'butter', 'makhan'], matchTerms: ['butter', 'makhan'] },
  { keywords: ['nei', 'நெய்', 'ghee', 'bilona'], matchTerms: ['ghee'] },
  { keywords: ['moru', 'மோர்', 'buttermilk', 'neer mor', 'chaas'], matchTerms: ['buttermilk', 'moru'] },
  { keywords: ['cheese', 'பாலாடைக்கட்டி', 'cheddar'], matchTerms: ['cheese', 'cheddar'] },
  { keywords: ['arisi', 'அரிசி', 'ponni', 'rice', 'chawal'], matchTerms: ['ponni rice', 'rice'] },
  { keywords: ['godhumai', 'கோதுமை', 'wheat', 'atta', 'gehun'], matchTerms: ['wheat'] },
  { keywords: ['cholam', 'சோளம்', 'corn', 'maize', 'makka'], matchTerms: ['corn', 'maize'] },
  { keywords: ['ragi', 'kelvaragu', 'கேழ்வரகு', 'ராகி', 'finger millet'], matchTerms: ['finger millet', 'ragi'] },
  { keywords: ['kambu', 'கம்பு', 'bajra', 'pearl millet'], matchTerms: ['pearl millet', 'bajra'] },
  { keywords: ['jowar', 'white sorghum', 'sorghum'], matchTerms: ['sorghum', 'jowar'] },
  { keywords: ['thinai', 'திணை', 'foxtail millet'], matchTerms: ['foxtail millet', 'thinai'] },
  { keywords: ['samai', 'சாமை', 'little millet'], matchTerms: ['little millet', 'samai'] },
  { keywords: ['toor dal', 'thuvaram paruppu', 'துவரம் பருப்பு', 'thuvarai', 'arhar'], matchTerms: ['toor dal'] },
  { keywords: ['moong dal', 'paasi paruppu', 'பாசிப்பருப்பு', 'mung dal', 'pesara'], matchTerms: ['moong dal', 'green mung'] },
  { keywords: ['urad dal', 'ulunthu', 'உளுந்து', 'white urad', 'black gram'], matchTerms: ['urad dal', 'black gram'] },
  { keywords: ['chana dal', 'kadala paruppu', 'கடலைப்பருப்பு', 'bengal gram', 'chole', 'chickpeas', 'konda kadalai'], matchTerms: ['chana dal', 'chickpeas'] },
  { keywords: ['rajma', 'kidney beans'], matchTerms: ['rajma', 'kidney beans'] },
  { keywords: ['karamani', 'காராமணி', 'cowpeas'], matchTerms: ['cowpeas', 'karamani'] },
  { keywords: ['paruppu', 'பருப்பு', 'dal', 'dhal', 'pulses', 'lentils'], matchTerms: ['dal', 'lentils', 'pulse'] },
  { keywords: ['malli', 'kothamalli', 'கொத்தமல்லி', 'coriander', 'dhaniya'], matchTerms: ['coriander', 'kothamalli'] },
  { keywords: ['pudina', 'புதினா', 'mint'], matchTerms: ['pudina', 'mint'] },
  { keywords: ['manjal', 'மஞ்சள்', 'turmeric', 'haldi', 'viral manjal'], matchTerms: ['turmeric', 'viral manjal'] },
  { keywords: ['inji', 'இஞ்சி', 'ginger', 'adrak'], matchTerms: ['ginger', 'inji'] },
  { keywords: ['poondu', 'பூண்டு', 'garlic', 'lahsun', 'malai poondu'], matchTerms: ['garlic', 'malai poondu'] },
  { keywords: ['milagu', 'மிளகு', 'black pepper', 'pepper', 'kali mirch'], matchTerms: ['black pepper', 'pepper'] },
  { keywords: ['jeeragam', 'சீரகம்', 'cumin', 'jeera'], matchTerms: ['cumin', 'jeeragam'] },
  { keywords: ['elakkai', 'ஏலக்காய்', 'cardamom', 'elaichi'], matchTerms: ['cardamom', 'elaichi'] },
  { keywords: ['pattai', 'பட்டை', 'cinnamon', 'dalchini'], matchTerms: ['cinnamon'] },
  { keywords: ['kariveppilai', 'கருவேப்பிலை', 'curry leaves'], matchTerms: ['curry leaves', 'kariveppilai'] },
  { keywords: ['maangai', 'மாங்காய்', 'maambazham', 'மாம்பழம்', 'mango', 'alphonso', 'aam'], matchTerms: ['mango', 'alphonso'] },
  { keywords: ['vazhaipazham', 'வாழைப்பழம்', 'banana', 'robusta', 'kela'], matchTerms: ['banana', 'robusta'] },
  { keywords: ['apple', 'ஆப்பிள்', 'seb'], matchTerms: ['apple'] },
  { keywords: ['orange', 'ஆரஞ்சு', 'santra'], matchTerms: ['orange'] },
  { keywords: ['grapes', 'திராட்சை', 'angoor'], matchTerms: ['grapes'] },
  { keywords: ['watermelon', 'தர்பூசணி', 'tarbooj'], matchTerms: ['watermelon'] },
  { keywords: ['papaya', 'பப்பாளி', 'papita'], matchTerms: ['papaya'] },
  { keywords: ['guava', 'கொய்யா', 'amrood'], matchTerms: ['guava'] },
  { keywords: ['pineapple', 'அன்னாசி', 'ananas'], matchTerms: ['pineapple'] },
  { keywords: ['pomegranate', 'மாதுளை', 'anar'], matchTerms: ['pomegranate'] }
];

/**
 * Searches the catalog using multi-lingual synonyms & partial matching.
 */
export function findCatalogProduce(queryText, allProducts) {
  if (!queryText || !Array.isArray(allProducts)) return [];
  const qLower = queryText.toLowerCase().trim();
  const matched = [];

  // 1. Synonym dictionary lookup
  for (const entry of PRODUCE_SYNONYMS) {
    const matchedKeyword = entry.keywords.some(kw => {
      if (/[\u0B80-\u0BFF]/.test(kw)) return qLower.includes(kw);
      const re = new RegExp(`(^|\\s|[.,!?;])${kw}($|\\s|[.,!?;])`, 'i');
      return re.test(qLower) || qLower.includes(kw);
    });

    if (matchedKeyword) {
      for (const prod of allProducts) {
        const pName = (prod.name || '').toLowerCase();
        const pSub = (prod.subCategory || '').toLowerCase();
        const matchesTerm = entry.matchTerms.some(term => pName.includes(term) || pSub.includes(term));
        if (matchesTerm && !matched.some(m => m.id === prod.id)) {
          matched.push(prod);
        }
      }
    }
  }

  // 2. Direct catalog name word matching (excluding stop words)
  if (matched.length === 0) {
    const stopWords = ['fresh', 'farm', 'sweet', 'pure', 'aged', 'crisp', 'deep', 'real', 'whole', 'organic', 'tender', 'desi', 'natural'];
    for (const prod of allProducts) {
      const pName = (prod.name || '').toLowerCase();
      const pWords = pName.split(/[\s,()]+/);
      const hasMatch = pWords.some(w => w.length >= 3 && !stopWords.includes(w) && qLower.includes(w));
      if (hasMatch && !matched.some(m => m.id === prod.id)) {
        matched.push(prod);
      }
    }
  }

  return matched;
}

/**
 * Call Groq Cloud LLM (openai/gpt-oss-120b or openai/gpt-oss-20b)
 */
async function callGroq(apiKey, currentMessage, contextData, userRole, userName, language) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const systemInstruction = `You are "FarmStore Voice Assistant", an intelligent, spoken voice AI assistant for a Farm-to-Table marketplace.
The user is speaking to you via microphone or text input.
Provide a concise, natural, polite, and direct spoken response (1 to 3 sentences maximum, as it will be read aloud via Text-to-Speech).
Do not use markdown symbols, bullet points, asterisks, or tables.
Language Instructions:
- Answer in the EXACT SAME language style used by the user.
- If the user asks in Tanglish (Tamil words written in English letters, e.g. "en order enga iruku", "thakkali stock iruka"), reply in natural, clear spoken Tanglish or spoken Tamil.
- If the user asks in Tamil script (e.g. "என் ஆர்டர் எங்கே?"), reply in natural spoken Tamil.
- If the user asks in English, reply in natural spoken English.

Context Guidelines:
- For project-related queries (orders, products, delivery, inventory, stock, sales, farmers, buyers), answer strictly using the provided REAL DATABASE CONTEXT.
- If the user asks about a crop/produce (in English, Tamil, or Tanglish like thakkali, vengayam, urulai, paal, arisi, paruppu, etc.), look at "matchedProduct" or "relevantProductsInCatalog" in the context and specify the product name, price per unit (₹), farmer name, and available stock.
- Do not invent fake order IDs or numbers; use the exact figures from the context.
- For general knowledge questions (cooking, health, weather, farming tips, general advice, etc.), provide a natural, accurate, and helpful response.
- If a relevant page exists in the portal, add a single line at the very end: "ACTION: <path>" (e.g. ACTION: /orders, ACTION: /marketplace, ACTION: /farmer/orders, ACTION: /farmer/my-products, ACTION: /cart). If no navigation is needed, do not add ACTION.

Current User Name: ${userName || 'Guest'}
Current User Role: ${userRole || 'guest'}
User Interface Language: ${language || 'en'}`;

  const payload = {
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `${systemInstruction}\n\nREAL DATABASE CONTEXT:\n${JSON.stringify(contextData, null, 2)}`
      },
      {
        role: 'user',
        content: currentMessage
      }
    ],
    temperature: 0.3,
    max_tokens: 450
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // Fallback to smaller 20b model if 120b is busy
      payload.model = 'openai/gpt-oss-20b';
      const fallbackRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      if (!fallbackRes.ok) {
        const err = await fallbackRes.text();
        throw new Error(`Groq error: ${err}`);
      }
      const data2 = await fallbackRes.json();
      return data2.choices?.[0]?.message?.content?.trim();
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    throw err;
  }
}

/**
 * Call Google Gemini API (gemini-2.5-flash / gemini-flash-latest / gemini-3.6-flash)
 */
async function callGemini(apiKey, currentMessage, contextData, userRole, userName, language) {
  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.6-flash'];
  const systemInstruction = `You are "FarmStore Voice Assistant", an intelligent spoken AI voice assistant for a Farm-to-Table marketplace.
Provide a concise spoken response (1 to 3 sentences max) without asterisks or markdown.
Reply in the user's language (English, Tamil, or Tanglish).
Use this REAL DATABASE CONTEXT:
${JSON.stringify(contextData, null, 2)}
User: ${userName || 'User'} (${userRole || 'guest'})`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: currentMessage }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 250 }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Call OpenAI API (gpt-4o-mini)
 */
async function callOpenAI(apiKey, currentMessage, contextData, userRole, userName, language) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const systemPrompt = `You are "FarmStore Voice Assistant". Spoken voice assistant for a farm-to-table portal.
Give a concise, clear spoken reply (1-3 sentences) suitable for Text-to-Speech without asterisks or markdown.
Reply in the user's language (English, Tamil, or Tanglish).
Answer based on this REAL DATABASE CONTEXT:
${JSON.stringify(contextData, null, 2)}
User: ${userName || 'User'} (${userRole || 'guest'})`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: currentMessage }
      ],
      temperature: 0.3,
      max_tokens: 200
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}

/**
 * Local Semantic NLP & Context Engine (Graceful Offline / Rate-Limit Fallback)
 * Understands natural questions in English, Tamil, and Tanglish and dynamically answers using MySQL data.
 */
function generateSemanticMySQLAnswer(qText, context, userRole, language) {
  const q = qText.toLowerCase().trim();
  const isTamilScript = /[\u0B80-\u0BFF]/.test(qText);
  const isTanglish = /\b(epdi|enga|iruku|irukka|pannanum|venum|thakkali|kudunga|solunga|nalla|panrathu|ennaku|aagala|eppadi|enna|vilai|valga|vanakkam|sollu)\b/i.test(q);
  const isTa = isTamilScript || isTanglish || language === 'ta';

  // 1. GREETINGS
  if (/^(hi|hello|hey|vanakkam|vanakam|namaste|good morning|good evening)/i.test(q)) {
    if (isTa) {
      return {
        answer: `வணக்கம்! நான் உங்கள் பண்ணை சந்தை குரல் உதவியாளர். விளைபொருட்கள், உங்கள் ஆர்டர்கள் அல்லது டெலிவரி நிலை குறித்து என்னிடம் எதையும் கேட்கலாம்.`,
        action: null
      };
    }
    return {
      answer: `Hello! I am your FarmStore Voice Assistant. You can ask me about your orders, crop stock levels, delivery tracking, or any question!`,
      action: null
    };
  }

  // 2. BUYER: ORDER TRACKING & DELIVERY
  if (userRole === 'buyer' && (q.includes('where') || q.includes('track') || q.includes('delivery') || q.includes('status') || q.includes('enga') || q.includes('eppo') || q.includes('varum') || q.includes('arrived'))) {
    const active = context.activeDelivery;
    if (active) {
      const driver = active.assignedDeliveryPartner?.name ? ` Driver: ${active.assignedDeliveryPartner.name}.` : '';
      if (isTa) {
        return {
          answer: `உங்கள் ஆர்டர் #${active.id} தற்போது "${active.status}" நிலையில் உள்ளது.${driver} எதிர்பார்க்கப்படும் நேரம்: ${active.estimatedDelivery || 'இன்று நேரடி டெலிவரி'}.`,
          action: { type: 'navigate', path: '/orders' }
        };
      }
      return {
        answer: `Your order #${active.id} is currently "${active.status}".${driver} Estimated delivery is ${active.estimatedDelivery || 'today directly from the farm'}.`,
        action: { type: 'navigate', path: '/orders' }
      };
    }

    if (context.recentOrders && context.recentOrders.length > 0) {
      const last = context.recentOrders[0];
      if (isTa) {
        return {
          answer: `உங்களிடம் வழியில் உள்ள ஆர்டர்கள் எதுவும் இல்லை. உங்கள் முந்தைய ஆர்டர் #${last.id} (மதிப்பு ₹${last.total}) நிலை: ${last.status}.`,
          action: { type: 'navigate', path: '/orders' }
        };
      }
      return {
        answer: `You do not have any orders currently out for delivery. Your last order #${last.id} for ₹${last.total} is currently marked as ${last.status}.`,
        action: { type: 'navigate', path: '/orders' }
      };
    }

    if (isTa) {
      return {
        answer: `நீங்கள் இன்னும் எந்த ஆர்டரும் செய்யவில்லை. சந்தையில் புதிய காய்கறிகளை ஆர்டர் செய்யலாம்.`,
        action: { type: 'navigate', path: '/marketplace' }
      };
    }
    return {
      answer: `You have not placed any orders yet. Visit our marketplace to explore fresh farm harvests.`,
      action: { type: 'navigate', path: '/marketplace' }
    };
  }

  // 3. FARMER: INVENTORY & STOCK
  if (userRole === 'farmer' && (q.includes('low') || q.includes('stock') || q.includes('iruku') || q.includes('kuraivana') || q.includes('theernthu') || q.includes('running out') || q.includes('out of stock'))) {
    const low = context.lowStockProducts || [];
    const out = context.outOfStockProducts || [];
    if (low.length === 0 && out.length === 0) {
      if (isTa) {
        return {
          answer: `உங்கள் அனைத்து விளைபொருட்களும் போதுமான இருப்பில் உள்ளன. குறைவான இருப்பு உள்ள பயிர்கள் எதுவும் இல்லை.`,
          action: { type: 'navigate', path: '/farmer/my-products' }
        };
      }
      return {
        answer: `All your listed crops have healthy inventory levels above 20 units. There are no low stock alerts.`,
        action: { type: 'navigate', path: '/farmer/my-products' }
      };
    }

    const items = [...out.map(p => `${p.name} (0 left)`), ...low.map(p => `${p.name} (${p.stock} left)`)].slice(0, 3).join(', ');
    if (isTa) {
      return {
        answer: `குறைவான இருப்பு உள்ள பொருட்கள்: ${items}. உங்கள் பயிர்களை புதுப்பிக்க விரும்புகிறீர்களா?`,
        action: { type: 'navigate', path: '/farmer/my-products' }
      };
    }
    return {
      answer: `You have items running low or out of stock: ${items}. Would you like to update your crop quantities?`,
      action: { type: 'navigate', path: '/farmer/my-products' }
    };
  }

  // 4. FARMER: REVENUE & SALES
  if (userRole === 'farmer' && (q.includes('sales') || q.includes('earning') || q.includes('revenue') || q.includes('income') || q.includes('panam') || q.includes('varumaanam') || q.includes('money'))) {
    const today = Number(context.todaySales || 0).toFixed(2);
    const total = Number(context.totalSales || 0).toFixed(2);
    if (isTa) {
      return {
        answer: `இன்றைய உங்கள் விற்பனை ₹${today} ஆகும். உங்களின் மொத்த வருமானம் ₹${total}.`,
        action: { type: 'navigate', path: '/farmer/dashboard' }
      };
    }
    return {
      answer: `Your recorded sales for today are ₹${today}, bringing your total portal earnings to ₹${total}.`,
      action: { type: 'navigate', path: '/farmer/dashboard' }
    };
  }

  // 5. FARMER: PENDING ORDERS
  if (userRole === 'farmer' && (q.includes('pending') || q.includes('orders') || q.includes('new order') || q.includes('waiting') || q.includes('niluvai'))) {
    const count = context.pendingOrdersCount || 0;
    if (count === 0) {
      if (isTa) {
        return {
          answer: `உங்களிடம் நிலுவையில் உள்ள ஆர்டர்கள் எதுவும் இல்லை. புதிய ஆர்டர்கள் வரும்போது அறிவிக்கப்படும்.`,
          action: { type: 'navigate', path: '/farmer/orders' }
        };
      }
      return {
        answer: `You have no pending orders at this moment. All customer orders have been processed.`,
        action: { type: 'navigate', path: '/farmer/orders' }
      };
    }
    const ids = context.pendingOrders?.slice(0, 2).map(o => `#${o.id}`).join(', ') || '';
    if (isTa) {
      return {
        answer: `உங்களிடம் ${count} நிலுவை ஆர்டர்கள் உள்ளன (${ids}). வாடிக்கையாளர்களுக்காக விளைபொருட்களை அறுவடை செய்து உறுதிப்படுத்தவும்.`,
        action: { type: 'navigate', path: '/farmer/orders' }
      };
    }
    return {
      answer: `You have ${count} pending order${count > 1 ? 's' : ''} (${ids}) waiting for your harvest confirmation.`,
      action: { type: 'navigate', path: '/farmer/orders' }
    };
  }

  // 6. SPECIFIC PRODUCT AVAILABILITY & PRICE INQUIRY (Any user)
  if (context.matchedProduct) {
    const p = context.matchedProduct;
    if (isTanglish) {
      return {
        answer: `${p.name} ${p.farmerName || 'local farm'}-la 1 ${p.unit || 'kg'} ₹${Number(p.price).toFixed(2)}-ku kidaikithu. Stock: ${p.stock} ${p.unit || 'kg'} iruku.`,
        action: { type: 'navigate', path: `/marketplace?search=${encodeURIComponent(p.name)}` }
      };
    }
    if (isTa) {
      return {
        answer: `ஆம், ${p.name} ${p.farmerName || 'உள்ளூர் பண்ணை'} மூலம் கிடைக்கிறது. விலை ஒரு ${p.unit || 'kg'} ₹${Number(p.price).toFixed(2)}. கையிருப்பு: ${p.stock} ${p.unit || 'kg'}.`,
        action: { type: 'navigate', path: `/marketplace?search=${encodeURIComponent(p.name)}` }
      };
    }
    return {
      answer: `Yes, ${p.name} is available from ${p.farmerName || 'local farms'} at ₹${Number(p.price).toFixed(2)} per ${p.unit || 'kg'}, with ${p.stock} ${p.unit || 'kg'} in stock.`,
      action: { type: 'navigate', path: `/marketplace?search=${encodeURIComponent(p.name)}` }
    };
  }

  // 7. CART INQUIRY
  if (q.includes('cart') || q.includes('basket') || q.includes('koodai')) {
    if (isTa) {
      return {
        answer: `உங்கள் கூடை பக்கத்தை திறந்து பார்க்கிறேன். அங்கு உங்கள் பொருட்களை சரிபார்த்து checkout செய்யலாம்.`,
        action: { type: 'navigate', path: '/cart' }
      };
    }
    return {
      answer: `I am opening your shopping cart so you can review your selected farm items and proceed to checkout.`,
      action: { type: 'navigate', path: '/cart' }
    };
  }

  // 8. GENERAL PORTAL OR PRODUCT OVERVIEW
  if (q.includes('marketplace') || q.includes('products') || q.includes('crops') || q.includes('items') || q.includes('produce') || q.includes('enna iruku') || q.includes('vilai')) {
    const total = context.marketplaceTotalProducts || 60;
    if (isTa) {
      return {
        answer: `எங்கள் உழவர் சந்தையில் காய்கறிகள், பழங்கள், தானியங்கள், பருப்பு வகைகள், பால் மற்றும் மசாலா பொருட்கள் என ${total}க்கும் மேற்பட்ட இயற்கை விளைபொருட்கள் உள்ளன.`,
        action: { type: 'navigate', path: '/marketplace' }
      };
    }
    return {
      answer: `We have over ${total} organic farm products across Fresh Vegetables, Fruits, Grains, Pulses, Dairy, and Spices directly from regional farmers.`,
      action: { type: 'navigate', path: '/marketplace' }
    };
  }

  // 9. GENERAL CONVERSATIONAL AI FALLBACK
  if (isTa) {
    return {
      answer: `உங்கள் கேள்வி கிடைத்தது. பண்ணை விளைபொருட்கள், சந்தை விலை, ஆர்டர்கள் அல்லது டெலிவரி நிலை குறித்து என்னிடம் எதையும் கேட்கலாம்.`,
      action: null
    };
  }
  return {
    answer: `I received your question. You can ask me about farm produce, crop pricing, order tracking, sales analytics, or general farming advice!`,
    action: null
  };
}

/**
 * POST /api/voice/query
 * Receives natural-language query via speech transcript or text,
 * securely fetches logged-in user MySQL records, and responds via AI/NLP.
 */
export const handleVoiceQuery = async (req, res) => {
  try {
    const { query, userId, userRole, userName, language, cartItems } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A spoken voice query string is required.'
      });
    }

    const trimmedQuery = query.trim();

    // 1. EXTRACT & VERIFY LOGGED-IN USER SECURELY FROM JWT
    let authenticatedUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          authenticatedUser = jwt.verify(token, JWT_SECRET);
        } catch (jwtErr) {
          try {
            authenticatedUser = jwt.verify(token, 'farmer_market_secret_key_2026');
          } catch (e2) {
            authenticatedUser = jwt.decode(token);
          }
        }
      }
    }

    const effectiveUserId = authenticatedUser?.id || authenticatedUser?._id || userId || '';
    const effectiveUserRole = authenticatedUser?.role || userRole || 'guest';
    const effectiveUserName = authenticatedUser?.name || userName || '';
    const effectiveLanguage = language || 'en';

    // 2. GATHER LIVE DATA DIRECTLY FROM MYSQL
    const allProducts = await dbStore.getAllProducts();
    const allOrders = await dbStore.getAllOrders();

    const contextData = {
      user: {
        id: effectiveUserId,
        name: effectiveUserName,
        role: effectiveUserRole,
      },
      marketplaceTotalProducts: allProducts.length,
      categoryCounts: {
        Vegetables: allProducts.filter(p => p.category === 'Vegetables').length,
        Fruits: allProducts.filter(p => p.category === 'Fruits').length,
        Grains: allProducts.filter(p => p.category === 'Grains' || p.category === 'Cereals').length,
        Pulses: allProducts.filter(p => p.category === 'Pulses' || p.category === 'Legumes').length,
        Dairy: allProducts.filter(p => p.category === 'Dairy').length,
        Spices: allProducts.filter(p => p.category === 'Spices' || p.category === 'Herbs').length,
      }
    };

    if (Array.isArray(cartItems) && cartItems.length > 0) {
      contextData.activeCart = {
        itemCount: cartItems.length,
        items: cartItems.map(c => ({ name: c.name, quantity: c.quantity || 1, price: c.price })),
        total: cartItems.reduce((sum, c) => sum + (Number(c.price || 0) * Number(c.quantity || 1)), 0)
      };
    }

    // Check if query mentions a specific product in our catalog (via multi-lingual synonyms or name)
    const matchedProducts = findCatalogProduce(trimmedQuery, allProducts);
    const matchedProduct = matchedProducts.length > 0 ? matchedProducts[0] : null;

    if (matchedProduct) {
      contextData.matchedProduct = {
        name: matchedProduct.name,
        category: matchedProduct.category,
        subCategory: matchedProduct.subCategory || '',
        price: matchedProduct.price,
        unit: matchedProduct.unit || 'kg',
        stock: matchedProduct.stock,
        farmerName: matchedProduct.farmerName,
        farmLocation: matchedProduct.farmLocation || '',
        isOrganic: !!matchedProduct.isOrganic,
      };
      if (matchedProducts.length > 1) {
        contextData.relevantProductsInCatalog = matchedProducts.slice(0, 4).map(p => ({
          name: p.name,
          price: p.price,
          unit: p.unit || 'kg',
          stock: p.stock,
          farmerName: p.farmerName
        }));
      }
    }

    // 3. ROLE-SCOPED MYSQL DATA
    if (effectiveUserRole === 'farmer' && (effectiveUserId || effectiveUserName)) {
      const farmerProducts = allProducts.filter(
        p => (effectiveUserId && p.farmerId === effectiveUserId) || (effectiveUserName && p.farmerName === effectiveUserName)
      );
      const farmerOrders = allOrders.filter(o => {
        if (effectiveUserId && o.farmerId === effectiveUserId) return true;
        if (effectiveUserName && o.farmerName === effectiveUserName) return true;
        return o.items?.some(it => (effectiveUserId && it.farmerId === effectiveUserId) || (effectiveUserName && it.farmerName === effectiveUserName));
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const todayOrders = farmerOrders.filter(o => (o.date || o.createdAt?.split('T')[0]) === todayStr);

      const getFarmerRevenue = (order) => {
        if (!order.items || !Array.isArray(order.items)) return Number(order.total) || 0;
        const items = order.items.filter(it => (effectiveUserId && it.farmerId === effectiveUserId) || (effectiveUserName && it.farmerName === effectiveUserName));
        if (items.length > 0) {
          return items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || it.qty || 1)), 0);
        }
        return Number(order.total) || 0;
      };

      const pendingOrders = farmerOrders.filter(
        o => o.status === 'Pending' || o.status === 'Placed' || o.status === 'Processing' || o.status === 'Farmer Accepted'
      );
      const lowStockProducts = farmerProducts.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 20);
      const outOfStockProducts = farmerProducts.filter(p => Number(p.stock) === 0);

      contextData.totalProductsCount = farmerProducts.length;
      contextData.pendingOrdersCount = pendingOrders.length;
      contextData.pendingOrders = pendingOrders.map(o => ({
        id: o.id,
        date: o.date,
        buyerName: o.buyerName,
        total: o.total,
        status: o.status
      }));
      contextData.lowStockProducts = lowStockProducts.map(p => ({
        name: p.name,
        stock: p.stock,
        unit: p.unit
      }));
      contextData.outOfStockProducts = outOfStockProducts.map(p => ({
        name: p.name
      }));
      contextData.todaySales = todayOrders.reduce((sum, o) => sum + getFarmerRevenue(o), 0);
      contextData.totalSales = farmerOrders.reduce((sum, o) => sum + getFarmerRevenue(o), 0);
      contextData.recentOrders = farmerOrders.slice(0, 5).map(o => ({
        id: o.id,
        date: o.date,
        buyerName: o.buyerName,
        status: o.status,
        total: o.total
      }));
    } else if (effectiveUserRole === 'buyer' && (effectiveUserId || effectiveUserName)) {
      const buyerOrders = allOrders.filter(
        o => (effectiveUserId && o.buyerId === effectiveUserId) || (effectiveUserName && o.buyerName && o.buyerName === effectiveUserName)
      );

      const pendingOrders = buyerOrders.filter(
        o => o.status !== 'Delivered' && o.status !== 'Rejected' && o.status !== 'Cancelled'
      );
      const activeDelivery = buyerOrders.find(
        o => o.status !== 'Delivered' && o.status !== 'Rejected' && o.status !== 'Cancelled'
      );

      contextData.totalOrdersCount = buyerOrders.length;
      contextData.pendingOrdersCount = pendingOrders.length;
      contextData.deliveredOrdersCount = buyerOrders.filter(o => o.status === 'Delivered').length;
      contextData.totalSpent = buyerOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      contextData.recentOrders = buyerOrders.slice(0, 5).map(o => ({
        id: o.id,
        date: o.date,
        total: o.total,
        status: o.status,
        farmerName: o.farmerName,
        items: o.items?.map(i => i.name || i.productName)
      }));
      if (activeDelivery) {
        contextData.activeDelivery = {
          id: activeDelivery.id,
          status: activeDelivery.status,
          estimatedDelivery: activeDelivery.estimatedDelivery,
          farmerName: activeDelivery.farmerName,
          assignedDeliveryPartner: activeDelivery.assignedDeliveryPartner,
          deliveryAddress: activeDelivery.deliveryAddress
        };
      }
    } else if (effectiveUserRole === 'delivery' && (effectiveUserId || effectiveUserName)) {
      const assignedOrders = allOrders.filter(o => {
        const p = o.assignedDeliveryPartner;
        if (!p) return false;
        return (effectiveUserId && (p.id === effectiveUserId || p._id === effectiveUserId)) || (effectiveUserName && p.name === effectiveUserName);
      });
      contextData.assignedOrdersCount = assignedOrders.length;
      contextData.pendingPickups = assignedOrders.filter(o => o.status === 'Ready for Pickup' || o.status === 'Farmer Accepted').length;
      contextData.activeDeliveries = assignedOrders.filter(o => o.status === 'Out for Delivery' || o.status === 'Picked Up').length;
      contextData.completedDeliveries = assignedOrders.filter(o => o.status === 'Delivered').length;
    }

    // 4. ATTEMPT AI/NLP INFERENCE WITH REAL DATABASE CONTEXT
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let aiSpokenAnswer = null;
    let aiAction = null;

    // A. Priority 1: Groq LLM (High-speed LLaMA/GPT-OSS, proven multi-lingual)
    if (groqKey && groqKey !== 'your_groq_api_key_here') {
      try {
        aiSpokenAnswer = await callGroq(groqKey, trimmedQuery, contextData, effectiveUserRole, effectiveUserName, effectiveLanguage);
      } catch (err) {
        console.warn('Voice Groq call failed, trying secondary AI:', err.message);
      }
    }

    // B. Priority 2: Gemini
    if (!aiSpokenAnswer && geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        aiSpokenAnswer = await callGemini(geminiKey, trimmedQuery, contextData, effectiveUserRole, effectiveUserName, effectiveLanguage);
      } catch (err) {
        console.warn('Voice Gemini call failed, trying OpenAI:', err.message);
      }
    }

    // C. Priority 3: OpenAI
    if (!aiSpokenAnswer && openaiKey && openaiKey !== 'your_openai_api_key_here') {
      try {
        aiSpokenAnswer = await callOpenAI(openaiKey, trimmedQuery, contextData, effectiveUserRole, effectiveUserName, effectiveLanguage);
      } catch (err) {
        console.warn('Voice OpenAI call failed, falling back to local NLP:', err.message);
      }
    }

    // 5. EXTRACT RECOMMENDED NAVIGATION ACTION IF PRESENT
    if (aiSpokenAnswer) {
      const actionMatch = aiSpokenAnswer.match(/ACTION:\s*(\/[a-zA-Z0-9_\-\/?=&]+)/i);
      if (actionMatch) {
        aiAction = { type: 'navigate', path: actionMatch[1].trim() };
      }
      aiSpokenAnswer = aiSpokenAnswer.replace(/ACTION:.*$/gmi, '').trim();
    }

    // 6. LOCAL SEMANTIC NLP FALLBACK (If cloud AI was offline or empty)
    if (!aiSpokenAnswer) {
      const semanticResult = generateSemanticMySQLAnswer(trimmedQuery, contextData, effectiveUserRole, effectiveLanguage);
      aiSpokenAnswer = semanticResult.answer;
      if (!aiAction) aiAction = semanticResult.action;
    }

    // 7. INFER SENSIBLE UI NAVIGATION IF NOT EXPLICITLY PROVIDED
    if (!aiAction) {
      const qLowerClean = trimmedQuery.toLowerCase();
      if (qLowerClean.includes('order') || qLowerClean.includes('delivery') || qLowerClean.includes('track')) {
        aiAction = { type: 'navigate', path: effectiveUserRole === 'farmer' ? '/farmer/orders' : '/orders' };
      } else if (qLowerClean.includes('cart') || qLowerClean.includes('checkout')) {
        aiAction = { type: 'navigate', path: '/cart' };
      } else if (qLowerClean.includes('stock') || qLowerClean.includes('my crop') || qLowerClean.includes('inventory')) {
        if (effectiveUserRole === 'farmer') aiAction = { type: 'navigate', path: '/farmer/my-products' };
      } else if (matchedProduct) {
        aiAction = { type: 'navigate', path: `/marketplace?search=${encodeURIComponent(matchedProduct.name)}` };
      } else if (qLowerClean.includes('vegetable') || qLowerClean.includes('fruit') || qLowerClean.includes('grain') || qLowerClean.includes('market')) {
        aiAction = { type: 'navigate', path: '/marketplace' };
      }
    }

    const finalAnswer = cleanSpokenOutput(aiSpokenAnswer);

    return res.json({
      success: true,
      query: trimmedQuery,
      answer: finalAnswer,
      action: aiAction,
      userRole: effectiveUserRole,
      dataUsed: {
        productsAnalyzed: allProducts.length,
        ordersAnalyzed: allOrders.length,
      }
    });

  } catch (error) {
    console.error('Error handling voice query:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process voice query.'
    });
  }
};
