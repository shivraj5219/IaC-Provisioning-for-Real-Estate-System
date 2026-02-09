const express = require("express");
const { getWeather } = require("../controllers/weatherController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/weather?village=Rampur
router.get("/", protect, getWeather);

module.exports = router;
