const Razorpay = require('razorpay');

// Check if running in mock/test mode
const isMockMode = process.env.PAYMENT_MODE === 'mock' || 
                   !process.env.RAZORPAY_KEY_ID || 
                   !process.env.RAZORPAY_KEY_SECRET;

if (isMockMode) {
  console.log('⚠️  Running in MOCK PAYMENT MODE');
  console.log('   Razorpay integration disabled');
  // Export a mock razorpay instance
  module.exports = null;
} else {
  console.log('🔑 Razorpay Keys Loaded:');
  console.log('   Key ID:', process.env.RAZORPAY_KEY_ID);
  console.log('   Secret:', process.env.RAZORPAY_KEY_SECRET ? '***' + process.env.RAZORPAY_KEY_SECRET.slice(-4) : 'NOT SET');

  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  module.exports = razorpayInstance;
}
