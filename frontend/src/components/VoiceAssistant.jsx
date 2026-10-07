import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Command, 
  CornerDownLeft,
  ShoppingBag,
  ShoppingCart,
  Package,
  HelpCircle,
  Sprout,
  Loader2,
  Cpu,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, token: authToken, isFarmer, isBuyer } = useAuth();
  const { cart, addToCart } = useCart();
  const { products } = useProducts();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // Set to Indian English or Tamil based on portal language; both recognize English/Tamil names well
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setAssistantResponse(language === 'ta' ? 'கேட்கிறேன்... எந்த கேள்வியையும் கேளுங்கள்.' : 'Listening... Ask any question in English, Tamil, or Tanglish.');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const spokenText = event.results[current][0].transcript;
      setTranscript(spokenText);
      handleVoiceCommand(spokenText);
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setAssistantResponse('Microphone permission denied. Please allow microphone access or type your question below.');
      } else if (event.error === 'no-speech') {
        setAssistantResponse('No voice detected. Click the mic to speak or type your question below.');
      } else {
        setAssistantResponse(`Voice recognition error: ${event.error}. You can also type your question below.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language, products, currentUser]);

  // Voice synthesis feedback
  const speakText = (text) => {
    if (speechMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags and symbols for natural speech
      const cleanSpokenText = text
        .replace(/[*#_`]/g, '')
        .replace(/\bACTION:.*$/gi, '')
        .trim();

      if (!cleanSpokenText) return;

      const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select Tamil voice if available and query is in Tamil script
      const isTamilScript = /[\u0B80-\u0BFF]/.test(cleanSpokenText);
      if (isTamilScript) {
        const voices = window.speechSynthesis.getVoices();
        const taVoice = voices.find(v => v.lang.startsWith('ta'));
        if (taVoice) utterance.voice = taVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (!isSupported) {
      setAssistantResponse('Speech recognition is not supported in this browser. You can type your question in the box below!');
      setIsOpen(true);
      return;
    }

    if (!isOpen) {
      setIsOpen(true);
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  // Process voice questions & commands with AI + real MySQL data
  const handleVoiceCommand = async (cmdText) => {
    if (!cmdText || !cmdText.trim()) return;
    const text = cmdText.toLowerCase().trim();

    // 1. FAST CLIENT-SIDE ADD TO CART ("add [produce] to cart")
    if (text.includes('add') && text.includes('cart')) {
      const cleanName = text
        .replace(/add/g, '')
        .replace(/to cart/g, '')
        .replace(/in cart/g, '')
        .replace(/please/g, '')
        .trim();

      const produceMap = {
        thakkali: 'tomato', 'தக்காளி': 'tomato',
        urulai: 'potato', 'உருளை': 'potato',
        vengayam: 'shallot', 'வெங்காயம்': 'shallot',
        vendakkai: 'okra', 'வெண்டைக்காய்': 'okra',
        kathirikkai: 'brinjal', 'கத்தரிக்காய்': 'brinjal',
        paal: 'milk', 'பால்': 'milk',
        thayir: 'curd', 'தயிர்': 'curd',
        nei: 'ghee', 'நெய்': 'ghee',
        arisi: 'rice', 'அரிசி': 'rice',
        manjal: 'turmeric', inji: 'ginger', poondu: 'garlic',
        malli: 'coriander', kothamalli: 'coriander', pudina: 'mint'
      };

      let searchTarget = cleanName;
      for (const [kw, mapped] of Object.entries(produceMap)) {
        if (cleanName.includes(kw)) {
          searchTarget = mapped;
          break;
        }
      }

      const matchedProduct = products.find((p) => {
        const prodName = p.name.toLowerCase();
        return (cleanName && (prodName.includes(cleanName) || cleanName.includes(prodName))) ||
               (searchTarget && prodName.includes(searchTarget));
      });

      if (matchedProduct) {
        addToCart(matchedProduct, 1);
        const reply = `Added 1 ${matchedProduct.unit || 'kg'} of fresh ${matchedProduct.name} to your cart.`;
        setAssistantResponse(reply);
        speakText(reply);
        return;
      }
    }

    // 2. DYNAMIC AI QUERY WITH REAL MYSQL DATABASE INTEGRATION
    setIsLoadingAi(true);
    setAssistantResponse(language === 'ta' ? 'சிந்திக்கிறது...' : 'Analyzing with AI & Database...');

    try {
      const token =
        authToken ||
        currentUser?.token ||
        (typeof localStorage !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('farmstore_token')
          : null);

      const response = await fetch('/api/voice/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          query: cmdText,
          userId: currentUser?.id,
          userRole: currentUser?.role || 'guest',
          userName: currentUser?.name || '',
          language: language || 'en',
          cartItems: cart || [],
        }),
      });

      let answered = false;
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.answer) {
            setAssistantResponse(data.answer);
            speakText(data.answer);
            answered = true;
            if (data.action?.type === 'navigate' && data.action?.path) {
              setTimeout(() => navigate(data.action.path), 1500);
            }
          }
        }
      }

      if (!answered) {
        const lower = cmdText.toLowerCase();
        let fallback = '';
        if (lower.includes('price') || lower.includes('rate') || lower.includes('விலை') || lower.includes('cost')) {
          fallback = language === 'ta'
            ? 'தக்காளி ₹28/kg, சின்ன வெங்காயம் ₹45/kg, உருளைக்கிழங்கு ₹24/kg மற்றும் பூண்டு ₹180/kg விலையில் கிடைக்கின்றன.'
            : 'Country Tomatoes are ₹28.5/kg, Small Onions ₹45/kg, and Malai Poondu Garlic is ₹180/kg directly from local farms.';
        } else if (lower.includes('order') || lower.includes('ஆர்டர்') || lower.includes('cart')) {
          fallback = language === 'ta'
            ? 'உங்கள் ஆர்டர்களைக் காண Orders பக்கத்திற்கு செல்லலாம்.'
            : 'You can track and manage your live routed orders in the Orders tab.';
          setTimeout(() => navigate(currentUser?.role === 'farmer' ? '/farmer/dashboard' : '/orders'), 1500);
        } else if (lower.includes('farmer') || lower.includes('விவசாயி') || lower.includes('farm')) {
          fallback = language === 'ta'
            ? 'விவசாயிகள் தங்கள் விளைபொருட்களை இடைத்தரகர்கள் இன்றி நேரடியாக நியாய விலையில் விற்கலாம்.'
            : 'Verified farmers sell GI-tagged organic harvests directly with zero commission.';
        } else {
          fallback = language === 'ta'
            ? 'வணக்கம்! உழவர் சந்தை தளத்திற்கு வருக. இயற்கை விளைபொருட்கள் மற்றும் சந்தை விலைகளை இங்கு தெரிந்துகொள்ளலாம்.'
            : 'Welcome to Farmer Market Portal! You can browse 60+ verified organic harvests directly from regional farmers.';
        }
        setAssistantResponse(fallback);
        speakText(fallback);
      }
    } catch (err) {
      console.warn('Voice query fallback notice:', err.message);
      const fallback = language === 'ta'
        ? 'வணக்கம்! உழவர் சந்தை தளத்திற்கு வருக. காய்கறிகள் மற்றும் விளைபொருட்களை சந்தையிலிருந்து வாங்கலாம்.'
        : 'Welcome to Farmer Market Web Portal. You can explore fresh farm-to-table harvests.';
      setAssistantResponse(fallback);
      speakText(fallback);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Handle typing question via text input
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isLoadingAi) return;
    const query = textInput.trim();
    setTextInput('');
    setTranscript(query);
    handleVoiceCommand(query);
  };

  // Dynamic role-based suggestion question chips (Suggestions only; user can ask ANY question)
  const sampleCommands = isFarmer
    ? [
        'What are my pending orders?',
        'Which products are low in stock?',
        'What are my sales today?',
        'என்னிடம் என்ன பயிர்கள் உள்ளன?',
        'Enakku pending orders irukka?',
        'Show my customer orders'
      ]
    : isBuyer
    ? [
        'Where is my delivery?',
        'What are my recent orders?',
        'Do you have fresh tomatoes?',
        'என் ஆர்டர் எங்கே உள்ளது?',
        'En order eppo varum?',
        'Thakkali vilai enna?'
      ]
    : [
        'How many products are available?',
        'What categories are available?',
        'Do you have fresh organic fruits?',
        'எங்களிடம் என்னென்ன பொருட்கள் உள்ளன?',
        'Marketplace-la enna items iruku?',
        'How to make vegetable soup?'
      ];

  return (
    <>
      {/* 🎤 FLOATING MICROPHONE BUTTON */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={toggleListening}
            className={`group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-2xl border-2 transition-all duration-200 cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white border-white animate-pulse ring-4 ring-rose-300 shadow-rose-900/40 scale-105'
                : 'bg-gradient-to-r from-emerald-700 via-farm-800 to-farm-900 text-white hover:from-emerald-800 hover:to-farm-950 border-emerald-300/40 shadow-farm-900/40 hover:scale-105'
            }`}
            title="Click to speak voice command"
            aria-label="Activate Voice Assistant"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base shadow-inner ${
              isListening ? 'bg-white text-rose-600 animate-bounce' : 'bg-white/20 text-white'
            }`}>
              <Mic className="w-4 h-4" />
            </div>

            <div className="flex flex-col text-left pr-1">
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-extrabold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-rose-300 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                {isListening ? 'Listening...' : 'AI Voice Assistant'}
              </span>
              <span className="font-bold text-xs text-white">
                {isListening ? 'Speak now...' : 'Tap to Speak'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* VOICE ASSISTANT INTERACTIVE MODAL */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-farm-800 to-farm-900 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-colors ${
                isListening ? 'bg-rose-500 animate-pulse' : 'bg-white/15'
              }`}>
                🎤
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm sm:text-base">
                    Farm Voice Assistant
                  </h3>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase flex items-center gap-1 ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-400 text-stone-950'
                  }`}>
                    {isListening ? 'Live Listening' : 'AI Powered'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-emerald-300" />
                  <span>Real MySQL Data • English / தமிழ் / Tanglish</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSpeechMuted(!speechMuted)}
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title={speechMuted ? 'Unmute voice replies' : 'Mute voice replies'}
              >
                {speechMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.speechSynthesis?.cancel();
                    recognitionRef.current?.stop();
                  } catch (e) {}
                  setIsOpen(false);
                }}
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Area */}
          <div className="p-4 sm:p-5 space-y-3.5 bg-stone-50/70 dark:bg-stone-950/50 max-h-[75vh] overflow-y-auto">
            
            {/* Listening Visualizer / Mic Action */}
            <div className="flex flex-col items-center justify-center py-3.5 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-xs text-center space-y-2.5">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform cursor-pointer active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-950/80 scale-110'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/30 hover:scale-105'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7 animate-bounce" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>

              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-white">
                  {isListening ? 'Listening... Speak now!' : 'Click microphone or type question below'}
                </p>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isListening ? 'Ask about orders, delivery, stock, or any question' : 'Ask ANY question in English, தமிழ், or Tanglish'}
                </span>
              </div>
            </div>

            {/* Live Transcript Display */}
            {transcript && (
              <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">You asked:</span>
                <p className="font-semibold text-stone-900 dark:text-white italic">
                  "{transcript}"
                </p>
              </div>
            )}

            {/* Assistant Response Box */}
            {assistantResponse && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    AI Response (Live Data)
                  </span>
                  {isLoadingAi ? (
                    <span className="text-emerald-600 animate-spin font-normal">
                      <Loader2 className="w-3 h-3 inline mr-1" /> Thinking...
                    </span>
                  ) : isSpeaking ? (
                    <span className="text-emerald-600 animate-pulse font-normal">
                      🔊 Speaking...
                    </span>
                  ) : null}
                </div>
                <p className="text-emerald-950 dark:text-emerald-200 font-medium whitespace-pre-line leading-relaxed">
                  {assistantResponse}
                </p>
              </div>
            )}

            {/* Quick Type Question Input */}
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={language === 'ta' ? 'கேள்வியை தட்டச்சு செய்யவும்...' : 'Type any question (English, Tamil, Tanglish)...'}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isLoadingAi || !textInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                title="Send Question"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>

            {/* Suggestion Chips (Not restricted; hints for user) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">
                {language === 'ta' ? 'மாதிரி பரிந்துரைகள் (எதையும் கேட்கலாம்):' : 'Suggested Questions (You can ask anything):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleCommands.map((cmd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(cmd);
                      handleVoiceCommand(cmd);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 text-[11px] font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer text-left shadow-2xs"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>Powered by AI & Live MySQL</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400">Natural Language</span>
          </div>

        </div>
      )}
    </>
  );
}
