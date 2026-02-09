const express = require('express');
const router = express.Router();
const { recommendLabour } = require('../controllers/labourController');
const { protect } = require('../middlewares/authMiddleware');

// Route to get smart labour recommendations (protected route for farmers)
router.post('/recommend', protect, recommendLabour);

module.exports = router;