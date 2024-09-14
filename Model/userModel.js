const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
      trim: true,
    },
    
    email: {
      type: String,
      unique: true,
      required: [true, "please enter your email"],
    },
    password: {
      type: String,
      required: [true, "please enter your password"],
      minLength: [6, "password should be greater than 6"],
    },
    role: {
      type: String,
      enum: ["user", "manager","admin"],
      default: "user",
      select:false
    },
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose?.models?.User || mongoose.model("User", userSchema);

module.exports = User;