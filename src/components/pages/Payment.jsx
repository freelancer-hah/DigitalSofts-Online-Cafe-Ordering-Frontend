import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

const stripeKey = import.meta.env.VITE_STRIPE_KEY;

if (!stripeKey) {
  console.error('❌ VITE_STRIPE_KEY is not set in .env file');
}

const stripePromise = loadStripe(stripeKey);

const CardInput = ({ setCardComplete }) => {
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = (event) => {
    setIsComplete(event.complete);
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="bg-white p-4 rounded-lg border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition">
        <CardElement
          onChange={handleChange}
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: 'Arial, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
                iconColor: '#6772e5',
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 text-xs text-gray-500">
        <span>💳 Test Card: 4242 4242 4242 4242</span>
        <span>•</span>
        <span>📅 Exp: 12/34</span>
        <span>•</span>
        <span>🔐 CVC: 123</span>
      </div>
    </div>
  );
};

const CheckoutForm = ({ orderData, orderId, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const { clearCart } = useCart(); // ✅ Get clearCart function

  useEffect(() => {
    if (!stripeKey) {
      toast.error('Payment system not configured');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        console.log('💰 Creating payment intent...');
        const response = await api.post('/payments/create-intent', {
          amount: totalAmount,
          orderId: orderId,
          customerName: orderData.customerName,
          phone: orderData.phone
        });
        console.log('✅ Payment intent created:', response.data);
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('❌ Error creating payment intent:', error);
        toast.error('Failed to initialize payment');
        setError('Could not initialize payment. Please try again.');
      }
    };

    if (orderId && totalAmount) {
      createPaymentIntent();
    }
  }, [totalAmount, orderId, orderData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    if (!cardComplete) {
      toast.error('Please complete your card details');
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    try {
      console.log('💳 Confirming payment...');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: orderData.customerName,
              phone: orderData.phone,
            },
          },
        }
      );

      if (stripeError) {
        console.error('❌ Stripe error:', stripeError);
        setError(stripeError.message);
        toast.error(stripeError.message);
        setLoading(false);
        return;
      }

      console.log('📊 Payment intent result:', paymentIntent);

      if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded! Verifying with backend...');
        
        const verifyResponse = await api.post('/payments/verify', {
          paymentIntentId: paymentIntent.id,
          orderId: orderId
        });

        console.log('📦 Verify response:', verifyResponse.data);

        if (verifyResponse.data.success) {
          // ✅ CLEAR CART HERE - IMPORTANT!
          clearCart();
          console.log('🗑️ Cart cleared successfully');
          
          toast.success('🎉 Payment successful! Your order has been placed.');
          navigate(`/track/${orderData.orderNumber}`, { 
            state: { justPlaced: true } 
          });
        } else {
          setError('Payment verification failed. Please contact support.');
          toast.error('Payment verification failed');
        }
      } else {
        setError(`Payment not completed. Status: ${paymentIntent?.status}`);
        toast.error(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!stripeKey) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <p className="font-semibold">⚠️ Payment System Not Configured</p>
        <p className="text-sm">Please use Cash on Delivery option.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardInput setCardComplete={setCardComplete} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-orange-600">Rs {totalAmount}</p>
        </div>
        <button
          type="submit"
          disabled={!stripe || loading || !clientSecret || !cardComplete}
          className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            '💳 Pay Now'
          )}
        </button>
      </div>
    </form>
  );
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!location.state?.orderData) {
      toast.error('No order data found');
      navigate('/checkout');
      return;
    }

    const { orderData, orderId } = location.state;
    setOrderData(orderData);
    setOrderId(orderId);
  }, [location.state, navigate]);

  if (!orderData || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">💳 Complete Payment</h1>
            <p className="text-gray-500 text-sm mt-1">
              Order #{orderData.orderNumber}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">📋 Order Summary</h3>
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm py-1">
                <span>{item.name} × {item.quantity}</span>
                <span>Rs {item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-orange-600">Rs {orderData.totalAmount}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                orderData={orderData} 
                orderId={orderId}
                totalAmount={orderData.totalAmount}
              />
            </Elements>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;