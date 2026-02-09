import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PaymentButton.css';

const PaymentButton = ({ job, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Calculate total amount
      const durationDays = parseInt(job.duration) || 1;
      const totalAmount = job.wage * durationDays;
      
      console.log('💳 Initiating payment for:', {
        jobId: job._id,
        amount: totalAmount,
        wage: job.wage,
        duration: durationDays
      });

      // Create order
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job._id,
          amount: totalAmount
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      console.log('✅ Order created:', data.orderId);

      // MOCK MODE - Skip Razorpay and directly verify
      if (data.mockMode) {
        console.log('⚠️ MOCK PAYMENT MODE - Simulating payment');
        alert('⚠️ MOCK PAYMENT MODE\n\nThis is a test payment. No real money will be charged.\n\nTo use real payments, get Razorpay API keys from:\nhttps://dashboard.razorpay.com');
        
        // Simulate payment after 2 seconds
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: data.orderId,
                razorpay_payment_id: 'pay_mock_' + Date.now(),
                razorpay_signature: 'mock_signature',
                jobId: job._id,
                mockMode: true
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert('✅ Mock Payment Successful!\n\nPayment has been completed in test mode.');
              onPaymentSuccess && onPaymentSuccess();
            }
          } catch (error) {
            console.error('Mock verification error:', error);
          } finally {
            setLoading(false);
          }
        }, 2000);
        
        return;
      }

      // Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'Krishi Sangam',
        description: `Payment for ${job.title}`,
        image: '/logo.png',
        handler: async (response) => {
          console.log('✅ Payment successful:', response);
          
          // Verify payment
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId: job._id
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert('Payment successful! ✅\n\nPayment has been completed successfully. The labour will receive the amount in 2-3 business days.');
              onPaymentSuccess && onPaymentSuccess();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          jobId: job._id,
          jobTitle: job.title
        },
        theme: {
          color: '#4caf50'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });

      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment: ' + error.message);
      setLoading(false);
    }
  };

  const durationDays = parseInt(job.duration) || 1;
  const totalAmount = job.wage * durationDays;

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="payment-button"
      title={`Pay ₹${totalAmount} for ${durationDays} day(s) work`}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Processing...
        </>
      ) : (
        <>
          💳 Pay ₹{totalAmount}
        </>
      )}
    </button>
  );
};

export default PaymentButton;
