import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMicrophone, 
  FaStop,
  FaTimes,
  FaVolumeUp,
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api/api';

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const VoiceOrdering = () => {
  const { addToCart, cart, clearCart } = useCart();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedItems, setDetectedItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMenuLoaded, setIsMenuLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const autoAddTimeout = useRef(null);

  // Fetch menu items on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching menu...');
        const res = await api.get('/menu');
        setMenuItems(res.data);
        setIsMenuLoaded(true);
        setIsLoading(false);
        console.log('✅ Menu loaded:', res.data.map(i => i.name));
      } catch (error) {
        console.error('❌ Error fetching menu:', error);
        setIsLoading(false);
        toast.error('Failed to load menu. Please refresh.');
      }
    };
    fetchMenu();
  }, []);

  // Setup speech recognition
  useEffect(() => {
    if (!isMenuLoaded || menuItems.length === 0) {
      console.log('⏳ Waiting for menu to load...');
      return;
    }

    if (!SpeechRecognition) {
      setIsSupported(false);
      toast.error('Voice recognition not supported. Please use Chrome.');
      return;
    }

    console.log('🎤 Setting up speech recognition...');

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    recognitionInstance.maxAlternatives = 10;

    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      const fullText = finalTranscript || interimTranscript;
      setTranscript(fullText);
      console.log('🎤 Heard:', fullText);

      if (finalTranscript && finalTranscript.length > 3) {
        if (autoAddTimeout.current) {
          clearTimeout(autoAddTimeout.current);
        }
        
        autoAddTimeout.current = setTimeout(() => {
          detectAndAddItems(finalTranscript);
        }, 1500);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Please allow microphone access');
      }
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      if (autoAddTimeout.current) {
        clearTimeout(autoAddTimeout.current);
      }
    };
  }, [isMenuLoaded, menuItems]);

  // Detect AND Add items automatically
  const detectAndAddItems = (text) => {
    if (isProcessing) return;
    if (!text || text.trim().length === 0) return;
    
    if (!isMenuLoaded || menuItems.length === 0) {
      toast.error('Menu is still loading. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);
    const detected = [];
    const addedNames = new Set();
    const lowerText = text.toLowerCase().trim();
    
    console.log('🔍 Searching in menu:', menuItems.map(i => i.name));
    console.log('🎤 Text:', lowerText);

    // Extract quantity from text
    const extractQuantity = (text) => {
      const matches = text.match(/\b(\d+)\s*(?:x\s*)?/g);
      if (matches) {
        const nums = matches.map(m => parseInt(m.replace(/[^0-9]/g, ''))).filter(n => n > 0 && n <= 20);
        return nums.length > 0 ? nums[0] : 1;
      }
      return 1;
    };

    // SMART DETECTION
    menuItems.forEach(item => {
      const itemName = item.name.toLowerCase();
      const words = itemName.split(' ');
      
      // Strategy 1: Exact match
      if (lowerText.includes(itemName) && !addedNames.has(item.name)) {
        const qty = extractQuantity(lowerText);
        detected.push({ ...item, quantity: qty });
        addedNames.add(item.name);
        console.log(`✅ Exact match: ${item.name} x${qty}`);
        return;
      }
      
      // Strategy 2: Word-by-word (for multi-word items)
      if (words.length > 1) {
        let matchedCount = 0;
        words.forEach(word => {
          if (word.length > 2 && lowerText.includes(word)) matchedCount++;
        });
        if (matchedCount >= words.length * 0.5 && !addedNames.has(item.name)) {
          const qty = extractQuantity(lowerText);
          detected.push({ ...item, quantity: qty });
          addedNames.add(item.name);
          console.log(`✅ Partial match: ${item.name} x${qty}`);
        }
      }
      
      // Strategy 3: Single word match
      if (words.length === 1 && words[0].length > 2 && !addedNames.has(item.name)) {
        const regex = new RegExp(`\\b${words[0]}\\b`, 'i');
        if (regex.test(lowerText)) {
          const qty = extractQuantity(lowerText);
          detected.push({ ...item, quantity: qty });
          addedNames.add(item.name);
          console.log(`✅ Single word match: ${item.name} x${qty}`);
        }
      }
    });

    // Fuzzy search if no match
    if (detected.length === 0) {
      menuItems.forEach(item => {
        const itemName = item.name.toLowerCase();
        const words = itemName.split(' ');
        const matched = words.some(word => word.length > 2 && lowerText.includes(word));
        if (matched && !addedNames.has(item.name)) {
          const qty = extractQuantity(lowerText);
          detected.push({ ...item, quantity: qty });
          addedNames.add(item.name);
          console.log(`✅ Fuzzy match: ${item.name} x${qty}`);
        }
      });
    }

    console.log('📊 Detected:', detected);

    // AUTO-ADD items to cart
    if (detected.length > 0) {
      detected.forEach(item => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          addToCart(item);
        }
      });
      
      const itemNames = detected.map(i => `${i.quantity || 1}x ${i.name}`).join(', ');
      toast.success(`🛒 Added ${itemNames} to cart!`);
      
      setDetectedItems(detected);
      setShowPanel(true);
      
      setTimeout(() => {
        setShowPanel(false);
        setDetectedItems([]);
        setTranscript('');
      }, 4000);
      
    } else {
      const suggestions = menuItems.slice(0, 5).map(i => i.name).join(', ');
      toast.error(`❌ Could not find "${text}". Try: ${suggestions}`);
      setShowPanel(true);
    }
    
    setIsProcessing(false);
  };

  // Start listening
  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice recognition not supported. Please use Chrome.');
      return;
    }

    if (!isMenuLoaded || menuItems.length === 0) {
      toast.error('⏳ Menu is loading... Please wait a moment.');
      return;
    }

    if (!recognition) {
      toast.error('Speech recognition not initialized');
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
      setShowPanel(true);
      setTranscript('');
      setDetectedItems([]);
      toast.success('🎤 Listening... Speak your order', { duration: 2000 });
    } catch (error) {
      console.error('Error starting:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping:', error);
      }
    }
    setIsListening(false);
    if (autoAddTimeout.current) {
      clearTimeout(autoAddTimeout.current);
    }
  };

  const clearDetected = () => {
    setDetectedItems([]);
    setShowPanel(false);
    setTranscript('');
  };

  const quickCommands = [
    { text: '📋 Menu', action: () => { window.location.href = '/menu'; } },
    { text: '🛒 Cart', action: () => { window.location.href = '/cart'; } },
    { text: '🗑️ Clear', action: () => { clearCart(); toast.success('Cart cleared'); } },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed bottom-24 right-4 z-50">
        <button className="p-4 rounded-full shadow-2xl bg-gray-400 text-white cursor-not-allowed" disabled>
          <FaSpinner className="h-8 w-8 animate-spin" />
        </button>
        <div className="absolute bottom-20 right-0 w-64 bg-white rounded-2xl shadow-2xl p-3 text-center">
          <p className="text-xs text-gray-500">⏳ Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="fixed bottom-24 right-4 z-50">
        <button className="p-4 rounded-full shadow-2xl bg-gray-400 text-white cursor-not-allowed" disabled>
          <FaMicrophone className="h-8 w-8" />
        </button>
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl p-4 text-center">
          <p className="text-sm text-gray-600">⚠️ Voice not supported.<br/><span className="text-xs text-gray-400">Use Chrome</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Voice Button - WITHOUT CART BADGE */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isListening ? 'bg-red-500 voice-pulse' : 'bg-gradient-to-r from-orange-500 to-orange-600'
        } text-white relative`}
      >
        {isListening ? <FaStop className="h-8 w-8" /> : <FaMicrophone className="h-8 w-8" />}
        {/* ❌ CART BADGE REMOVED - No number on voice button */}
      </motion.button>

      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap animate-pulse">
          🎤 Listening...
        </div>
      )}

      {/* Voice Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[80vh]"
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isProcessing ? <FaSpinner className="h-5 w-5 animate-spin" /> : <FaVolumeUp className="h-5 w-5" />}
                <span className="font-semibold">Voice Order</span>
                {isListening && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">Live</span>}
              </div>
              <button onClick={clearDetected} className="text-white/80 hover:text-white transition">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-100 min-h-[60px]">
              <p className="text-sm text-gray-600">
                {transcript || `Say: "2 Chicken Karahi" or "I want ${menuItems[0]?.name || 'Biryani'}"`}
              </p>
              {isListening && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-gray-400">Listening...</span>
                </div>
              )}
            </div>

            {detectedItems.length > 0 && (
              <div className="p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-gray-500 mb-2">✅ Detected & Added:</p>
                {detectedItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-green-50 rounded-lg p-3 mb-2 border border-green-200">
                    <div>
                      <p className="font-medium text-sm text-green-700">{item.name}</p>
                      <p className="text-xs text-gray-500">Rs {item.price} × {item.quantity || 1}</p>
                    </div>
                    <span className="text-green-600 font-bold">✓ Added</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">💡 Just speak naturally:</p>
              <div className="flex flex-wrap gap-2">
                {quickCommands.map((cmd, idx) => (
                  <button key={idx} onClick={cmd.action} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-orange-50 hover:border-orange-300 transition">
                    {cmd.text}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Try: "2 {menuItems[0]?.name || 'Chicken Karahi'}" or "I want {menuItems[1]?.name || 'Biryani'}"
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceOrdering;