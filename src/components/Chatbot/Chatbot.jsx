import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import api from '../../api/api';
import toast from 'react-hot-toast';

const Chatbot = ({ activeWidget, setActiveWidget }) => {
  // ✅ isOpen now derives from the shared parent state instead of local state
  const isOpen = activeWidget === 'chat';
  const setIsOpen = (val) => setActiveWidget(val ? 'chat' : null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 Hello! Welcome to Spice Corner. How can I help you today?\n\nYou can ask me about:\n• 📦 Order tracking\n• 🍽️ Menu items\n• 🕐 Timings\n• 🚚 Delivery\n• 📞 Contact'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: messages.length + 1, sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const orderMatch = input.match(/ORD-[A-Z0-9]{6}/i);
      const orderNumber = orderMatch ? orderMatch[0].toUpperCase() : null;

      const response = await api.post('/chat/ask', {
        message: input,
        orderNumber: orderNumber
      });

      if (response.data.success) {
        const botMessage = {
          id: messages.length + 2,
          sender: 'bot',
          text: response.data.reply
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.reply || 'Unknown error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: '😅 Sorry, I\'m having trouble right now. Please try again later or contact us directly.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { text: '📦 Track my order' },
    { text: '🍽️ Show menu' },
    { text: '🕐 What are timings?' },
    { text: '🚚 Delivery info' },
    { text: '📞 Contact details' },
  ];

  return (
    <>
      {/* ✅ Fixed bottom position — lowest button in the stack, sits above the other two */}
      <div className="fixed bottom-6 right-4 z-[9999] pointer-events-auto">
        {/* Chat Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-110'
          } text-white relative pointer-events-auto`}
        >
          {isOpen ? <FaTimes className="h-8 w-8" /> : <FaComments className="h-8 w-8" />}
        </button>

        {/* Chat Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              // ✅ bottom-full + mb-4 anchors the panel directly above THIS button,
              // no matter where the button sits on the screen — no more hardcoded
              // bottom-20 clipping and no more collision with the other widgets.
              className="absolute bottom-full mb-4 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto"
              style={{ maxHeight: '70vh', zIndex: 99999 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 flex justify-between items-center pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-semibold">Spice Assistant</h3>
                    <p className="text-xs text-blue-100">AI-powered • Online</p>
                  </div>
                </div>
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-50 pointer-events-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-white text-gray-700 shadow-sm border border-gray-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 flex-wrap pointer-events-auto">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q.text)}
                    className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-300 transition whitespace-nowrap pointer-events-auto"
                  >
                    {q.text}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2 pointer-events-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none text-sm pointer-events-auto"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2.5 rounded-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                >
                  {loading ? <FaSpinner className="h-5 w-5 animate-spin" /> : <FaPaperPlane className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Chatbot;
