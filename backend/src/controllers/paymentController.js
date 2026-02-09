const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Job = require('../models/job.model');
const Payment = require('../models/payment.model');

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { jobId, amount } = req.body;
    
    console.log('💳 Creating order for job:', jobId, 'Amount:', amount);
    console.log('👤 User:', { id: req.user?._id, role: req.user?.role });
    
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('❌ Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }
    
    console.log('📋 Job found:', { 
      id: job._id, 
      title: job.title, 
      createdBy: job.createdBy,
      assignedTo: job.assignedTo,
      wage: job.wage,
      duration: job.duration
    });
    
    // Verify farmer owns this job
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to make payment for this job' });
    }
    
    // Verify labour is assigned
    if (!job.assignedTo) {
      return res.status(400).json({ message: 'No labour assigned to this job yet' });
    }
    
    // Calculate total if not provided
    const totalAmount = amount || (job.wage * (parseInt(job.duration) || 1));
    
    // MOCK MODE - For testing without real Razorpay keys
    if (process.env.PAYMENT_MODE === 'mock') {
      console.log('⚠️ MOCK PAYMENT MODE - Using fake order');
      
      const mockOrderId = `order_mock_${Date.now()}`;
      
      // Save mock payment record
      const payment = await Payment.create({
        job: jobId,
        farmer: req.user._id,
        labour: job.assignedTo,
        amount: totalAmount,
        razorpayOrderId: mockOrderId,
        status: 'created',
        receipt: `mock_receipt_${Date.now()}`
      });
      
      // Update job
      job.paymentStatus = 'processing';
      job.totalAmount = totalAmount;
      await job.save();
      
      return res.json({
        orderId: mockOrderId,
        amount: totalAmount * 100,
        currency: 'INR',
        keyId: 'rzp_test_mock_key',
        payment: payment,
        job: {
          id: job._id,
          title: job.title,
          wage: job.wage,
          duration: job.duration
        },
        mockMode: true
      });
    }
    
    const options = {
      amount: Math.round(totalAmount * 100), // Amount in paise (₹100 = 10000 paise)
      currency: 'INR',
      receipt: `job_${jobId}_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        jobId: jobId,
        jobTitle: job.title,
        farmerId: req.user._id.toString(),
        labourId: job.assignedTo.toString(),
        wage: job.wage,
        duration: job.duration
      }
    };
    
    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log('✅ Razorpay order created:', order.id);
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', razorpayError);
      return res.status(500).json({ 
        message: 'Razorpay authentication failed. Please check your API keys.',
        error: razorpayError.error?.description || razorpayError.message,
        hint: 'Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file'
      });
    }
    
    // Save payment record
    const payment = await Payment.create({
      job: jobId,
      farmer: req.user._id,
      labour: job.assignedTo,
      amount: totalAmount,
      razorpayOrderId: order.id,
      status: 'created',
      receipt: options.receipt
    });
    
    // Update job with payment info
    job.paymentStatus = 'processing';
    job.totalAmount = totalAmount;
    job.paymentDetails = {
      razorpayOrderId: order.id,
      amount: totalAmount,
      receipt: options.receipt
    };
    await job.save();
    
    console.log('💾 Payment record saved:', payment._id);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      payment: payment,
      job: {
        id: job._id,
        title: job.title,
        wage: job.wage,
        duration: job.duration
      }
    });
    
  } catch (error) {
    console.error('❌ Create order error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({ 
      message: error.message || 'Failed to create payment order',
      error: error.toString(),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      jobId,
      mockMode 
    } = req.body;
    
    console.log('🔐 Verifying payment:', razorpay_payment_id);
    
    // MOCK MODE - Skip signature verification
    if (mockMode || process.env.PAYMENT_MODE === 'mock') {
      console.log('⚠️ MOCK PAYMENT MODE - Skipping signature verification');
      
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature || 'mock_signature',
          status: 'success',
          paidAt: new Date()
        },
        { new: true }
      );
      
      // Update job
      const job = await Job.findByIdAndUpdate(
        jobId,
        {
          paymentStatus: 'completed',
          'paymentDetails.orderId': razorpay_order_id,
          'paymentDetails.paymentId': razorpay_payment_id,
          'paymentDetails.paidAt': new Date()
        },
        { new: true }
      );
      
      // Auto-trigger mock payout to labour (async, don't wait)
      setTimeout(async () => {
        try {
          console.log('🚀 Auto-triggering mock payout for payment:', payment._id);
          const payoutController = require('./payoutController');
          await payoutController.transferToLabour({
            body: { paymentId: payment._id.toString() },
            user: req.user
          }, {
            json: (data) => console.log('✅ Auto-payout result:', data.message),
            status: (code) => ({ json: (data) => console.log('❌ Auto-payout error:', data) })
          });
        } catch (error) {
          console.error('❌ Auto-payout failed:', error.message);
        }
      }, 3000); // Wait 3 seconds after payment confirmation
      
      return res.json({ 
        success: true, 
        message: 'Mock payment verified successfully. Money transfer initiated.',
        payment: payment,
        job: {
          id: job._id,
          title: job.title,
          paymentStatus: job.paymentStatus
        }
      });
    }
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (isAuthentic) {
      console.log('✅ Payment signature verified');
      
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'success',
          paidAt: new Date()
        },
        { new: true }
      );
      
      // Update job payment status
      const job = await Job.findByIdAndUpdate(
        jobId,
        {
          paymentStatus: 'completed',
          'paymentDetails.orderId': razorpay_order_id,
          'paymentDetails.paymentId': razorpay_payment_id,
          'paymentDetails.paidAt': new Date()
        },
        { new: true }
      );
      
      console.log('💰 Payment completed for job:', job.title);
      
      // Send notification to labour about payment
      const notificationController = require('./notificationController');
      await notificationController.createNotification({
        recipient: payment.labour,
        sender: req.user._id,
        type: 'payment_received',
        title: '💰 Payment Received!',
        message: `Farmer has made payment of ₹${payment.amount} for "${job.title}". Money transfer is being processed.`,
        jobId: job._id,
        paymentId: payment._id
      });
      
      // Auto-trigger payout to labour (async, don't wait)
      setTimeout(async () => {
        try {
          console.log('🚀 Auto-triggering payout for payment:', payment._id);
          const payoutController = require('./payoutController');
          await payoutController.transferToLabour({
            body: { paymentId: payment._id.toString() },
            user: req.user
          }, {
            json: (data) => console.log('✅ Auto-payout result:', data.message),
            status: (code) => ({ json: (data) => console.log('❌ Auto-payout error:', data) })
          });
        } catch (error) {
          console.error('❌ Auto-payout failed:', error.message);
        }
      }, 3000); // Wait 3 seconds after payment confirmation
      
      res.json({ 
        success: true, 
        message: 'Payment verified and completed successfully. Money transfer initiated.',
        payment: payment,
        job: {
          id: job._id,
          title: job.title,
          paymentStatus: job.paymentStatus
        }
      });
    } else {
      console.error('❌ Payment signature verification failed');
      
      // Mark payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      
      await Job.findByIdAndUpdate(jobId, {
        paymentStatus: 'failed'
      });
      
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed - Invalid signature' 
      });
    }
    
  } catch (error) {
    console.error('❌ Verify payment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Payment verification failed',
      error: error.toString()
    });
  }
};

// Get payment details for a job
exports.getPaymentDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const payment = await Payment.findOne({ job: jobId })
      .populate('farmer', 'fullName email phone')
      .populate('labour', 'fullName email phone')
      .populate('job', 'title wage duration');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all payments for farmer
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ farmer: req.user._id })
      .populate('labour', 'fullName email phone')
      .populate('job', 'title wage duration type')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all received payments for labour
exports.getReceivedPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ 
      labour: req.user._id,
      status: 'success'
    })
      .populate('farmer', 'fullName email phone')
      .populate('job', 'title wage duration type')
      .sort({ paidAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get received payments error:', error);
    res.status(500).json({ message: error.message });
  }
};
