const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  fullName: {
    firstName: { type: String, required: true },
    lastName: { type: String }
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["farmer", "labour"], // sirf ye 2 allowed honge
    required: true
  },
  location: {
    village: String,
    district: String,
    state: String
  },
  address: String, // Full address for farmer/labour
  farmSize: Number, // Farm size in acres (for farmers)
  crops: String, // Crops grown by farmer
  skills: [String], // sirf labour ke liye useful
  
  // Bank Account Details (for Labour - to receive payments)
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    upiId: String, // Alternative to bank account
    verified: { type: Boolean, default: false }
  },
  
  // Razorpay Contact & Fund Account IDs (for payouts)
  razorpayContactId: String,
  razorpayFundAccountId: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Index: Prevent same name in same role (Farmer/Labour)
userSchema.index(
  { "fullName.firstName": 1, "fullName.lastName": 1, role: 1 },
  { unique: true }
);

// ✅ Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
