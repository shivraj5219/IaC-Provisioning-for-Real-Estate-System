require("dotenv").config();
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, name, fullName, email, phone, password, role, skills } = req.body;
    console.log("Register payload:", req.body);

    // Normalize name fields to ensure fullName.firstName is present
    let normalizedFirstName = firstName;
    let normalizedLastName = lastName;

    // If a single name string provided
    if (!normalizedFirstName && typeof name === "string") {
      const parts = name.trim().split(/\s+/);
      normalizedFirstName = parts[0] || "";
      normalizedLastName = parts.slice(1).join(" ") || normalizedLastName;
    }

    // If fullName provided as string or object
    if (!normalizedFirstName && fullName) {
      if (typeof fullName === "string") {
        const parts = fullName.trim().split(/\s+/);
        normalizedFirstName = parts[0] || "";
        normalizedLastName = parts.slice(1).join(" ") || normalizedLastName;
      } else if (typeof fullName === "object") {
        normalizedFirstName = fullName.firstName || fullName.givenName || normalizedFirstName;
        normalizedLastName = fullName.lastName || fullName.familyName || normalizedLastName;
        // As a fallback, try parsing fullName.name if present
        if (!normalizedFirstName && typeof fullName.name === "string") {
          const parts = fullName.name.trim().split(/\s+/);
          normalizedFirstName = parts[0] || "";
          normalizedLastName = parts.slice(1).join(" ") || normalizedLastName;
        }
      }
    }

    // Required field checks (early, friendly errors)
    if (!normalizedFirstName) {
      return res.status(400).json({
        message: "Validation error: firstName is required",
        hint: "Send either { firstName, lastName } or a 'name'/'fullName' that includes the first name."
      });
    }
    if (!email || !phone || !password || !role) {
      return res.status(400).json({
        message: "Validation error: email, phone, password and role are required"
      });
    }

    // Check if user exists (email unique)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Optionally ensure phone uniqueness as well
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone already in use" });
    }

    // Create new user
    const user = await User.create({
      fullName: { firstName: normalizedFirstName, lastName: normalizedLastName },
      email,
      phone,
      password,
      role,
      skills,
      address: req.body.address,
      location: req.body.location, // Add location field
      farmSize: req.body.farmSize,
      crops: req.body.crops
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.fullName.firstName,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    // Handle duplicate key errors from MongoDB/Mongoose gracefully
    if (error && error.code === 11000) {
      const fields = Object.keys(error.keyValue || {});
      return res.status(400).json({ message: `Duplicate value for: ${fields.join(", ")}` });
    }
    res.status(500).json({ message: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      user: {
        _id: user._id,
        name: user.fullName.firstName,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile };
