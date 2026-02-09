const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const payoutController = require('../controllers/payoutController');

// Labour adds/updates bank details
router.post(
  '/bank-details',
  protect,
  authorizeRoles('labour'),
  payoutController.addBankDetails
);

// Farmer initiates transfer to labour
router.post(
  '/transfer',
  protect,
  authorizeRoles('farmer'),
  payoutController.transferToLabour
);

// Get payout status
router.get(
  '/status/:paymentId',
  protect,
  payoutController.getPayoutStatus
);

// Webhook for payout status updates (no auth needed - Razorpay calls this)
router.post(
  '/webhook',
  payoutController.payoutWebhook
);

module.exports = router;
