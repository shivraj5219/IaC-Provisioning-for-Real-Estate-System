const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  labour: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  status: {
    type: String,
    enum: ['created', 'pending', 'success', 'failed', 'refunded'],
    default: 'created'
  },
  
  paymentType: {
    type: String,
    enum: ['advance', 'full', 'final'],
    default: 'full'
  },
  
  // Payout Details (Transfer to Labour)
  payoutId: String, // Razorpay Payout ID
  payoutStatus: {
    type: String,
    enum: ['pending', 'queued', 'processing', 'processed', 'reversed', 'cancelled'],
    default: 'pending'
  },
  payoutUtr: String, // Bank UTR number
  transferredAt: Date,
  
  notes: String,
  receipt: String,
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  paidAt: Date
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;