const express = require('express');
const { 
  createOrder, 
  verifyPayment, 
  getPaymentDetails,
  getMyPayments,
  getReceivedPayments
} = require('../controllers/paymentController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Create payment order (Farmer only)
router.post('/create-order', protect, authorizeRoles('farmer'), createOrder);

// Verify payment (Farmer only)
router.post('/verify', protect, authorizeRoles('farmer'), verifyPayment);

// Get payment details for a job
router.get('/job/:jobId', protect, getPaymentDetails);

// Get all payments made by farmer
router.get('/my-payments', protect, authorizeRoles('farmer'), getMyPayments);

// Get all payments received by labour
router.get('/received', protect, authorizeRoles('labour'), getReceivedPayments);

module.exports = router;
