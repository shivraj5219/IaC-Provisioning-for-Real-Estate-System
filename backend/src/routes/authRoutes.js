const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Get user profile
router.get('/profile', protect, getProfile);

// Debug endpoint to check current user
router.get('/me', protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone
    },
    message: 'User authenticated successfully'
  });
});

// Generic register
router.post("/register", registerUser);

// Frontend expects separate endpoints for farmer/labour. Provide shim routes
router.post('/farmer/register', (req, res, next) => {
	req.body.role = 'farmer'; // Force set role
	return registerUser(req, res, next);
});

router.post('/labour/register', (req, res, next) => {
	req.body.role = 'labour'; // Force set role
	return registerUser(req, res, next);
});

// Generic login
router.post("/login", loginUser);

// Frontend login shims
router.post('/farmer/login', (req, res, next) => {
	return loginUser(req, res, next);
});

router.post('/labour/login', (req, res, next) => {
	return loginUser(req, res, next);
});

module.exports = router;
