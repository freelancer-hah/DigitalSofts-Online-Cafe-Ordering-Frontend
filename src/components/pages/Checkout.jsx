import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import api from "../../api/api.js";
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    customerName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "", // ✅ Add email field
    address: user?.address || "",
    orderType: "Pickup",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [locationCoords, setLocationCoords] = useState({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('03')) {
      cleaned = '+92' + cleaned.slice(1);
    }
    return cleaned;
  };

  // Location search autocomplete recommendations
  const handleAddressChange = async (e) => {
    const query = e.target.value;
    setForm((prev) => ({ ...prev, address: query }));

    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      const apiKey = import.meta.env.VITE_LOCATIONIQ_KEY;
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      if (apiKey) {
        url = `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&format=json`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Autocomplete search error:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    const addressText = item.display_name;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    setForm((prev) => ({ ...prev, address: addressText }));
    setLocationCoords({ lat, lng });
    setSuggestions([]);
    setShowDropdown(false);
    toast.success('📍 Delivery location selected!');
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    toast.loading('Detecting your location...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });

        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setForm((prev) => ({ ...prev, address: data.display_name }));
            toast.success('Location detected successfully!', { id: 'geo' });
          } else {
            toast.success(`Coordinates saved: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { id: 'geo' });
          }
        } catch (err) {
          toast.success(`Coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { id: 'geo' });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geo error:', error);
        toast.error(`Location detection failed: ${error.message}`, { id: 'geo' });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper component to enable pin selection by clicking on the map preview
  function MapClickEvents() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setLocationCoords({ lat, lng });
        toast.loading('Updating location...', { id: 'pin' });
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setForm((prev) => ({ ...prev, address: data.display_name }));
              toast.success('📍 Pin address updated!', { id: 'pin' });
            } else {
              toast.success('📍 Location pin updated!', { id: 'pin' });
            }
          })
          .catch(() => {
            toast.success('📍 Location pin updated!', { id: 'pin' });
          });
      },
    });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing) {
      toast.warning('Order is already being processed');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setSubmitting(true);
    setError("");

    try {
      const formattedPhone = formatPhone(form.phone);
      let finalCoords = [locationCoords.lng, locationCoords.lat];
      
      // If order is Delivery and coordinates are not set, attempt to geocode before submitting
      if (form.orderType === "Delivery" && (!locationCoords.lat || !locationCoords.lng) && form.address) {
        toast.loading("Resolving delivery address...", { id: "checkout-geocode" });
        try {
          const query = form.address;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            finalCoords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
            toast.success("Address location resolved!", { id: "checkout-geocode" });
          } else {
            // Try with "Pakistan" suffix fallback
            const queryPk = query.toLowerCase().includes('pakistan') ? query : `${query}, Pakistan`;
            const resPk = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryPk)}&limit=1`);
            const dataPk = await resPk.json();
            if (dataPk && dataPk.length > 0) {
              finalCoords = [parseFloat(dataPk[0].lon), parseFloat(dataPk[0].lat)];
              toast.success("Address location resolved!", { id: "checkout-geocode" });
            } else {
              toast.dismiss("checkout-geocode");
            }
          }
        } catch (err) {
          console.error("Geocoding failed during checkout submit:", err);
          toast.dismiss("checkout-geocode");
        }
      }

      const payload = {
        customerName: form.customerName,
        phone: formattedPhone,
        email: form.email,
        address: form.address,
        deliveryAddress: {
          street: form.address,
          coordinates: finalCoords[0] && finalCoords[1] ? [finalCoords[0], finalCoords[1]] : [0, 0]
        },
        orderType: form.orderType,
        notes: form.notes,
        items: cart.map((i) => ({
          menuItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      };
      
      console.log('📦 Creating order with email:', form.email);
      console.log('📦 Payload:', payload);
      
      const res = await api.post("/orders", payload);
      console.log('✅ Order created:', res.data);
      
      // ✅ Show email confirmation toast
      if (form.email) {
        toast.success(`📧 Confirmation email sent to ${form.email}`);
      }
      
      if (paymentMethod === 'stripe') {
        navigate('/payment', { 
          state: { 
            orderData: { 
              ...payload, 
              orderNumber: res.data.orderNumber, 
              totalAmount: cartTotal 
            },
            orderId: res.data._id
          } 
        });
      } else {
        clearCart();
        toast.success('✅ Order placed successfully! Check your email for confirmation.');
        navigate(`/track/${res.data.orderNumber}`, { state: { justPlaced: true } });
      }
    } catch (err) {
      console.error('❌ Order error:', err);
      setError(err.response?.data?.message || "Could not place order. Please try again.");
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setSubmitting(false);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-xl">Your cart is empty.</p>
        <p className="text-sm mt-2">Add items before checking out.</p>
        <button
          onClick={() => navigate('/menu')}
          className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-2">Order Summary</h2>
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between text-sm py-1">
              <span>{item.name} × {item.quantity}</span>
              <span>Rs {item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>Rs {cartTotal}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              required
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="you@example.com"
            />
            <p className="text-xs text-gray-400 mt-1">We'll send order confirmation and updates to this email</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              required
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="03XX-XXXXXXX"
            />
            <p className="text-xs text-gray-400 mt-1">Orders are linked to this phone number</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order Type</label>
            <select
              name="orderType"
              value={form.orderType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          {form.orderType === "Delivery" && (
            <div className="relative space-y-2">
              <label className="block text-sm font-medium">Delivery Address Search *</label>

              {/* Search Bar + Embedded Navigate Me Button */}
              <div className="relative flex items-center">
                <input
                  required
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleAddressChange}
                  onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                  className="w-full border border-gray-300 rounded-lg pl-3 pr-36 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  placeholder="Type address, street, area or city..."
                />

                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-orange-600 hover:bg-orange-700 text-white px-3 text-xs rounded-md font-medium transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                >
                  📍 {isLocating ? 'Locating...' : 'Navigate Me'}
                </button>
              </div>

              {/* Live Location Recommendations Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 left-0 right-0 top-16 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-xs text-gray-500 flex items-center gap-2">
                      <span className="animate-spin">⌛</span> Searching places...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400">No matching locations found. Try typing street or area.</div>
                  ) : (
                    suggestions.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSuggestion(item)}
                        className="p-3 border-b border-gray-50 hover:bg-orange-50 cursor-pointer transition flex items-start gap-2 text-xs text-gray-700"
                      >
                        <span className="text-orange-500 text-sm mt-0.5">📍</span>
                        <div>
                          <p className="font-semibold text-gray-900">{item.display_name.split(',')[0]}</p>
                          <p className="text-gray-500 text-[11px] line-clamp-1">{item.display_name}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Interactive Map Preview & Pin Placement */}
              {locationCoords.lat && locationCoords.lng ? (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                    <span>📍 <strong className="text-gray-800">Drop-off Pin Preview</strong> (Click map to change location pin)</span>
                    <span className="font-mono text-green-600 font-medium">({locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)})</span>
                  </p>
                  <div className="h-48 rounded-lg overflow-hidden border border-orange-200 shadow-sm relative">
                    <MapContainer
                      center={[locationCoords.lat, locationCoords.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker position={[locationCoords.lat, locationCoords.lng]}>
                        <Popup>🏠 Your Drop-off Location</Popup>
                      </Marker>
                      <MapClickEvents />
                    </MapContainer>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  💡 Type your address above to see search recommendations or click "Navigate Me" to pinpoint automatically.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="2"
              placeholder="Less spicy, no onions, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'stripe' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="text-2xl">💳</div>
                <div className="text-sm font-medium">Card Payment</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'cod' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="text-2xl">💵</div>
                <div className="text-sm font-medium">Cash on Delivery</div>
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-60"
          >
            {submitting ? "Processing..." : paymentMethod === 'stripe' ? "Pay Now" : "Place Order"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Checkout;