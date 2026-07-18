import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { FaCamera, FaUpload, FaSpinner, FaTimes } from 'react-icons/fa';
import api from '../../api/api';
import toast from 'react-hot-toast';

const VisionOrder = () => {
  const { addToCart } = useCart();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectedItem, setDetectedItem] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [description, setDescription] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [showUpload, setShowUpload] = useState(true);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB.');
      return;
    }

    setImage(file);
    setDetectedItem(null);
    setSuggestions([]);
    setDescription('');
    setAiModel('');
    setConfidence(0);
    setShowUpload(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setShowPanel(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRecognize = async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const uploadRes = await api.post('/vision/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('📤 Upload response:', uploadRes.data);

      const recognizeRes = await api.post('/vision/recognize', {
        imageBase64: uploadRes.data.imageBase64
      });

      console.log('🧠 Recognition result:', recognizeRes.data);

      if (recognizeRes.data.success) {
        setDetectedItem(recognizeRes.data.item);
        setConfidence(recognizeRes.data.confidence || 70);
        setDescription(recognizeRes.data.description || '');
        setAiModel(recognizeRes.data.model || 'AI');
        setShowUpload(false); // ✅ Hide upload after detection
        toast.success(`✅ Detected: ${recognizeRes.data.item.name}`);
      } else {
        setSuggestions(recognizeRes.data.suggestions || []);
        toast.info('🤔 Try selecting from suggestions below');
      }

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to recognize image');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (detectedItem) {
      addToCart(detectedItem);
      toast.success(`✅ Added ${detectedItem.name} to cart!`);
      // ✅ Full reset after adding to cart
      resetAll();
    }
  };

  const handleSuggestionClick = async (itemName) => {
    try {
      const res = await api.get('/menu');
      const item = res.data.find(i => i.name === itemName);
      if (item) {
        addToCart(item);
        toast.success(`✅ Added ${item.name} to cart!`);
        resetAll();
      }
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  // ✅ Reset everything
  const resetAll = () => {
    setImage(null);
    setPreview(null);
    setDetectedItem(null);
    setSuggestions([]);
    setConfidence(0);
    setDescription('');
    setAiModel('');
    setShowUpload(true);
    setShowPanel(false);
  };

  // ✅ Clear image for new upload - KEEPS detection result visible
  const clearImageForNewUpload = () => {
    setImage(null);
    setPreview(null);
    setShowUpload(true); // ✅ Re-enable upload area
  };

  return (
    <div className="fixed bottom-44 right-4 z-50">
      {/* Vision Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPanel(!showPanel)}
        className="p-4 rounded-full shadow-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all"
      >
        <FaCamera className="h-8 w-8" />
      </motion.button>

      {/* Vision Panel */}
      {showPanel && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ maxHeight: '80vh' }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaCamera /> Snap & Order
              </h3>
              <p className="text-xs text-purple-200">Upload food photo to order</p>
            </div>
            <button 
              onClick={() => setShowPanel(false)} 
              className="text-white/80 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
            {/* ✅ Image Upload - Shows when showUpload is true */}
            {showUpload && (
              <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-purple-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
                {preview ? (
                  <img src={preview} alt="Food" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div>
                    <FaUpload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload food photo</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                )}
              </label>
            )}

            {/* ✅ Detect Button */}
            {preview && showUpload && !detectedItem && !loading && (
              <button
                onClick={handleRecognize}
                disabled={loading}
                className="w-full mt-4 bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaCamera /> Detect Food
              </button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-4 text-center">
                <FaSpinner className="animate-spin h-8 w-8 mx-auto text-purple-500" />
                <p className="text-sm text-gray-500 mt-2">Recognizing...</p>
              </div>
            )}

            {/* AI Model Info */}
            {aiModel && (
              <div className="mt-2 text-center">
                <span className="text-[10px] text-gray-400">🤖 {aiModel}</span>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">📝 AI Description:</p>
                <p className="text-sm text-gray-700">{description}</p>
              </div>
            )}

            {/* ✅ Detected Item */}
            {detectedItem && (
              <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="font-medium text-green-700">✅ Detected:</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1 gap-3">
                  <div className="w-full sm:w-auto">
                    <p className="font-bold text-lg">{detectedItem.name}</p>
                    <p className="text-sm text-gray-500">Rs {detectedItem.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{confidence}% match</span>
                    </div>
                    {detectedItem.note && (
                      <p className="text-xs text-gray-400 italic mt-1">{detectedItem.note}</p>
                    )}
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex-shrink-0"
                  >
                    Add to Cart
                  </button>
                </div>

                {/* ✅ Upload New Image Button - Now working */}
                <button
                  onClick={clearImageForNewUpload}
                  className="w-full mt-3 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition text-sm"
                >
                  📸 Upload New Image
                </button>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">💡 Try these popular dishes:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(item => (
                    <button
                      key={item}
                      onClick={() => handleSuggestionClick(item)}
                      className="text-xs bg-gray-100 px-3 py-1.5 rounded-full hover:bg-purple-100 hover:text-purple-700 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No match message */}
            {!detectedItem && !suggestions.length && preview && !loading && (
              <div className="mt-4 text-center text-gray-500">
                <p className="text-sm">🤔 No match found</p>
                <p className="text-xs">Try taking a clearer photo or browse the menu</p>
                <button
                  onClick={() => window.location.href = '/menu'}
                  className="mt-2 text-purple-500 hover:text-purple-600 text-sm"
                >
                  Browse Menu →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VisionOrder;