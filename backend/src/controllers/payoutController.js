const razorpay = require('../config/razorpay');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const Job = require('../models/job.model');

// Add or Update Labour Bank Details
exports.addBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
    
    console.log('🏦 Adding bank details for labour:', req.user._id);
    
    // Update user with bank details
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        bankDetails: {
          accountHolderName,
          accountNumber,
          ifscCode,
          bankName,
          upiId,
          verified: false // Will be verified during first payout
        }
      },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Bank details added successfully',
      user: {
        id: user._id,
        bankDetails: user.bankDetails
      }
    });
  } catch (error) {
    console.error('❌ Add bank details error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create Razorpay Contact for Labour
const createRazorpayContact = async (labour) => {
  try {
    console.log('📞 Creating Razorpay contact for:', labour.email);
    
    const contact = await razorpay.contacts.create({
      name: `${labour.fullName.firstName} ${labour.fullName.lastName || ''}`.trim(),
      email: labour.email,
      contact: labour.phone,
      type: 'vendor', // Labour is treated as vendor
      reference_id: labour._id.toString(),
      notes: {
        role: 'labour',
        userId: labour._id.toString()
      }
    });
    
    console.log('✅ Contact created:', contact.id);
    
    // Save contact ID to user
    labour.razorpayContactId = contact.id;
    await labour.save();
    
    return contact;
  } catch (error) {
    console.error('❌ Create contact error:', error);
    throw error;
  }
};

// Create Razorpay Fund Account for Labour
const createRazorpayFundAccount = async (labour) => {
  try {
    console.log('💳 Creating fund account for:', labour.email);
    
    // Get or create contact first
    let contactId = labour.razorpayContactId;
    if (!contactId) {
      const contact = await createRazorpayContact(labour);
      contactId = contact.id;
    }
    
    const { accountNumber, ifscCode, accountHolderName } = labour.bankDetails;
    
    // Create fund account with bank details
    const fundAccount = await razorpay.fund_accounts.create({
      contact_id: contactId,
      account_type: 'bank_account',
      bank_account: {
        name: accountHolderName,
        ifsc: ifscCode,
        account_number: accountNumber
      }
    });
    
    console.log('✅ Fund account created:', fundAccount.id);
    
    // Save fund account ID to user
    labour.razorpayFundAccountId = fundAccount.id;
    labour.bankDetails.verified = true;
    await labour.save();
    
    return fundAccount;
  } catch (error) {
    console.error('❌ Create fund account error:', error);
    throw error;
  }
};

// Transfer Money to Labour (Payout)
exports.transferToLabour = async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    console.log('💸 Initiating transfer for payment:', paymentId);
    
    // Get payment details
    const payment = await Payment.findById(paymentId)
      .populate('labour')
      .populate('job');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }
    
    // Verify payment is completed
    if (payment.status !== 'success') {
      return res.status(400).json({ 
        success: false,
        message: 'Payment not completed yet' 
      });
    }
    
    // Verify payout not already done
    if (payment.payoutStatus === 'processed') {
      return res.status(400).json({ 
        success: false,
        message: 'Money already transferred to labour' 
      });
    }
    
    const labour = payment.labour;
    
    // Check if labour has bank details
    if (!labour.bankDetails || !labour.bankDetails.accountNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Labour bank details not found. Labour needs to add bank account first.' 
      });
    }
    
    // MOCK MODE - Simulate payout
    if (process.env.PAYMENT_MODE === 'mock') {
      console.log('⚠️ MOCK PAYOUT MODE - Simulating transfer');
      
      payment.payoutId = `pout_mock_${Date.now()}`;
      payment.payoutStatus = 'processed';
      payment.payoutUtr = `UTR${Date.now()}`;
      payment.transferredAt = new Date();
      await payment.save();
      
      // Send notification to labour about money transfer
      const notificationController = require('./notificationController');
      await notificationController.createNotification({
        recipient: labour._id,
        type: 'money_transferred',
        title: '✅ Money Received in Account!',
        message: `₹${payment.amount} has been successfully transferred to your bank account. UTR: ${payment.payoutUtr}`,
        jobId: payment.job,
        paymentId: payment._id
      });
      
      return res.json({
        success: true,
        message: 'Mock transfer completed',
        payout: {
          id: payment.payoutId,
          status: 'processed',
          utr: payment.payoutUtr,
          amount: payment.amount,
          labour: {
            name: `${labour.fullName.firstName} ${labour.fullName.lastName || ''}`,
            accountNumber: labour.bankDetails.accountNumber
          }
        },
        mockMode: true
      });
    }
    
    // Get or create fund account
    let fundAccountId = labour.razorpayFundAccountId;
    if (!fundAccountId) {
      const fundAccount = await createRazorpayFundAccount(labour);
      fundAccountId = fundAccount.id;
    }
    
    // Create payout
    console.log('💰 Creating payout of ₹', payment.amount);
    
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your Razorpay account number
      fund_account_id: fundAccountId,
      amount: Math.round(payment.amount * 100), // Amount in paise
      currency: 'INR',
      mode: 'IMPS', // IMPS, NEFT, RTGS, UPI
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: payment._id.toString(),
      narration: `Payment for Job: ${payment.job.title}`,
      notes: {
        paymentId: payment._id.toString(),
        jobId: payment.job._id.toString(),
        farmerId: payment.farmer.toString(),
        labourId: labour._id.toString()
      }
    });
    
    console.log('✅ Payout created:', payout.id);
    
    // Update payment with payout details
    payment.payoutId = payout.id;
    payment.payoutStatus = payout.status; // queued, pending, processing, processed
    payment.payoutUtr = payout.utr || null;
    payment.transferredAt = payout.status === 'processed' ? new Date() : null;
    await payment.save();
    
    res.json({
      success: true,
      message: 'Transfer initiated successfully',
      payout: {
        id: payout.id,
        status: payout.status,
        utr: payout.utr,
        amount: payment.amount,
        labour: {
          name: `${labour.fullName.firstName} ${labour.fullName.lastName || ''}`,
          accountNumber: labour.bankDetails.accountNumber
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Transfer error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
};

// Get Payout Status
exports.getPayoutStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId)
      .populate('labour', 'fullName email bankDetails')
      .populate('job', 'title');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }
    
    // If payout exists and not in final state, fetch latest status from Razorpay
    if (payment.payoutId && !payment.payoutId.startsWith('pout_mock') && 
        !['processed', 'reversed', 'cancelled'].includes(payment.payoutStatus)) {
      try {
        const payout = await razorpay.payouts.fetch(payment.payoutId);
        
        // Update if status changed
        if (payout.status !== payment.payoutStatus) {
          payment.payoutStatus = payout.status;
          payment.payoutUtr = payout.utr || payment.payoutUtr;
          if (payout.status === 'processed') {
            payment.transferredAt = new Date();
          }
          await payment.save();
        }
      } catch (error) {
        console.error('Error fetching payout status:', error);
      }
    }
    
    res.json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        payoutStatus: payment.payoutStatus,
        payoutUtr: payment.payoutUtr,
        transferredAt: payment.transferredAt,
        labour: payment.labour,
        job: payment.job
      }
    });
    
  } catch (error) {
    console.error('❌ Get payout status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Webhook to handle payout status updates
exports.payoutWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const payoutData = req.body.payload.payout.entity;
    
    console.log('📨 Payout webhook event:', event);
    
    // Find payment by payout ID
    const payment = await Payment.findOne({ payoutId: payoutData.id });
    
    if (payment) {
      payment.payoutStatus = payoutData.status;
      payment.payoutUtr = payoutData.utr || payment.payoutUtr;
      
      if (payoutData.status === 'processed') {
        payment.transferredAt = new Date();
      }
      
      await payment.save();
      console.log('✅ Payment updated with payout status:', payoutData.status);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Payout webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
