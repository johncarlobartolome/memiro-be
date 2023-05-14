const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const runValidators = require('mongoose-unique-validator')

const { log } = require("console");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide an email address"],
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a mobile number"],
    validate: {
      validator: function (val) {
        if (val.startsWith("09") && val.length === 11) {
          return true;
        } else return false;
      },
      message: "Invalid phone number",
    },
    unique: true,
  },
  firstName: {
    type: String,
    maxLength: [100, "A name should not exceed 100 characters"],
    required: [true, "Please fill in First Name"],
  },
  lastName: {
    type: String,
    maxLength: [100, "The last name should not exceed 100 characters"],
    required: [true, "Please fill in Last Name"],
  },
  userName: { type: String, unique: true },
  birthdate: {
    type: Date,
    required: [true, "Please provide complete birth date"],
  },
  gender: {
    type: String,
    required: [true, "Please tell us your gender"],
    enum: ["male", "female", "others"],
  },
  password: {
    type: String,
    minLength: [6, "Password should be at least 6 characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Password does not match!",
    },
  },
  status: {
    type: String,
    enum: ["active", "inactive", "disabled"],
    default: "active",
  },
  login_attempt: {
    type: Number,
    default: 0,
  },
  login_disabled_timestamp: Date,
});

userSchema.plugin(runValidators)

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.userName = (this.firstName + this.lastName).toLowerCase();
    this.userName = await bcrypt.hash(this.userName, 12);
    next();
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(`${this.password}`, 12);
    this.confirmPassword = undefined;
    next();
  }
  next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
