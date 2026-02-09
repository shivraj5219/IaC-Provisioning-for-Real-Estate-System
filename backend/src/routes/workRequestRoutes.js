const express = require('express');
const router = express.Router();
const { 
  sendWorkRequest, 
  getReceivedRequests, 
  getSentRequests,
  respondToRequest,
  cancelRequest 
} = require('../controllers/workRequestController');
const { protect } = require('../middlewares/authMiddleware');

// Farmer routes
router.post('/send', protect, sendWorkRequest);
router.get('/sent', protect, getSentRequests);
router.delete('/:requestId/cancel', protect, cancelRequest);

// Labour routes
router.get('/received', protect, getReceivedRequests);
router.post('/respond', protect, respondToRequest);

module.exports = router;
