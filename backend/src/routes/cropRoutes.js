const express = require("express");
const { predictCrop } = require("../controllers/cropController");
const router = express.Router();

router.post("/predict", predictCrop);

module.exports = router;
