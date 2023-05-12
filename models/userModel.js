const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { log } = require("console");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a mobile number"],
  },
  userName: String,
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

const hashData = async (data) => {
  return bcrypt.hash(data, 12);
};

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("email") || this.isNew) {
      this.email = await hashData(this.email);
    }
    if (this.isModified("phone") || this.isNew) {
      this.phone = await hashData(this.phone);
    }
    if (this.isModified("firstName") || this.isNew) {
      this.firstName = await hashData(this.firstName);
    }
    if (this.isModified("lastName") || this.isNew) {
      this.lastName = await hashData(this.lastName);
    }

    if (this.isModified("password") || this.isNew) {
      this.password = await hashData(this.password);
    }

    if (this.isModified("userName") || this.isNew) {
      this.userName = (this.firstName + this.lastName).toLowerCase();
      this.username = await hashData(this.username);
    }
    next();
  } catch (error) {}
});

const User = mongoose.model("User", userSchema);

module.exports = User;
