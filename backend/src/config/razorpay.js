const Razorpay = require('razorpay');

// Verify environment variables are loaded
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found in environment variables!');
  console.error('Please check your .env file and make sure these keys are set correctly.');
  throw new Error('Razorpay configuration missing');
}

console.log('🔑 Razorpay Keys Loaded:');
console.log('   Key ID:', process.env.RAZORPAY_KEY_ID);
console.log('   Secret:', process.env.RAZORPAY_KEY_SECRET ? '***' + process.env.RAZORPAY_KEY_SECRET.slice(-4) : 'NOT SET');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpayInstance;
