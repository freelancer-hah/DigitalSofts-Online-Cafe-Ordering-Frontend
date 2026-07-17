import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMicrophone, 
  FaStop,
  FaTimes,
  FaShoppingBag,
  FaVolumeUp,
  FaTrash
} from 'react-icons/fa';
import { MdMenu, MdShoppingCart } from 'react-icons/md';
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

  // Check if speech recognition is supported
  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        setMenuItems(res.data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };
    fetchMenu();
  }, []);

  // Setup speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullText = finalTranscript || interimTranscript;
      setTranscript(fullText);

      if (finalTranscript) {
        detectItemsFromSpeech(finalTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Please allow microphone access');
      }
      setIsListening(false);
      if (detectedItems.length === 0) {
        setShowPanel(false);
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      if (detectedItems.length === 0 && !transcript) {
        setShowPanel(false);
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [isSupported]);

  // Detect items from speech
  const detectItemsFromSpeech = (text) => {
    const detected = [];
    const lowerText = text.toLowerCase();
    const addedNames = new Set();

    menuItems.forEach(item => {
      const name = item.name.toLowerCase();
      const words = name.split(' ');
      
      const matched = words.some(word => 
        lowerText.includes(word) && word.length > 2
      );

      if (matched && !addedNames.has(item.name)) {
        addedNames.add(item.name);
        detected.push({ ...item, quantity: 1 });
      }
    });

    const numberMatches = text.match(/\d+/g);
    if (numberMatches && detected.length > 0) {
      detected[0].quantity = parseInt(numberMatches[0]) || 1;
    }

    setDetectedItems(detected);
    if (detected.length > 0) {
      setShowPanel(true);
    }
  };

  // Start listening
  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice recognition not supported in this browser');
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
      console.error('Error starting recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
  };

  // Add detected item to cart
  const addDetectedToCart = (item) => {
    const quantity = item.quantity || 1;
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    toast.success(`✅ Added ${quantity}x ${item.name} to cart!`);
    setDetectedItems(prev => prev.filter(i => i._id !== item._id));
    if (detectedItems.length === 1) {
      setShowPanel(false);
    }
  };

  // Add all detected items
  const addAllToCart = () => {
    detectedItems.forEach(item => {
      const quantity = item.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        addToCart(item);
      }
    });
    toast.success(`✅ Added ${detectedItems.length} items to cart!`);
    setDetectedItems([]);
    setShowPanel(false);
    setTranscript('');
  };

  // Clear detected
  const clearDetected = () => {
    setDetectedItems([]);
    setShowPanel(false);
    setTranscript('');
  };

  // Quick commands
  const quickCommands = [
    { 
      text: '📋 Menu', 
      action: () => { window.location.href = '/menu'; } 
    },
    { 
      text: '🛒 Cart', 
      action: () => { window.location.href = '/cart'; } 
    },
    { 
      text: '🗑️ Clear Cart', 
      action: () => { 
        clearCart();
        toast.success('Cart cleared');
      } 
    },
  ];

  // If not supported, show nothing
  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Voice Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 voice-pulse' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600'
        } text-white relative`}
      >
        {isListening ? (
          <FaStop className="h-8 w-8" />
        ) : (
          <FaMicrophone className="h-8 w-8" />
        )}
        
        {/* Cart badge */}
        {cart.length > 0 && !isListening && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            {cart.length}
          </span>
        )}
      </motion.button>

      {/* Status indicator */}
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
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaVolumeUp className="h-5 w-5" />
                <span className="font-semibold">Voice Order</span>
                {isListening && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
                    Live
                  </span>
                )}
              </div>
              <button
                onClick={clearDetected}
                className="text-white/80 hover:text-white transition"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Transcript */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 min-h-[60px]">
              <p className="text-sm text-gray-600">
                {transcript || 'Say something like: "I want Chicken Karahi"'}
              </p>
              {isListening && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-gray-400">Listening...</span>
                </div>
              )}
            </div>

            {/* Detected Items */}
            {detectedItems.length > 0 && (
              <div className="p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-gray-500 mb-2">🛒 Detected Items:</p>
                {detectedItems.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between bg-orange-50 rounded-lg p-3 mb-2 border border-orange-200"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Rs {item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.quantity && item.quantity > 1 && (
                        <span className="text-xs bg-orange-100 px-2 py-0.5 rounded-full">
                          ×{item.quantity}
                        </span>
                      )}
                      <button
                        onClick={() => addDetectedToCart(item)}
                        className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-600 transition"
                      >
                        Add
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Add All Button */}
                {detectedItems.length > 1 && (
                  <button
                    onClick={addAllToCart}
                    className="w-full bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition mt-2"
                  >
                    🛒 Add All ({detectedItems.length} items)
                  </button>
                )}
              </div>
            )}

            {/* Quick Commands */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">💡 Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickCommands.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={cmd.action}
                    className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-orange-50 hover:border-orange-300 transition"
                  >
                    {cmd.text}
                  </button>
                ))}
              </div>
              {menuItems.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Try: "I want {menuItems.slice(0, 2).map(i => i.name).join(' and ')}"
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceOrdering;