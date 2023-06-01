const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const runValidators = require("mongoose-unique-validator");
const crypto = require("crypto");
const { log } = require("console");
const { Timestamp } = require("bson");
const AppError = require("../utils/appError");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Please provide an email address"],
      validate: [validator.isEmail, "Please provide a valid email address"],
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
    loginDisabledTimestamp: { type: Date, timestamp: true },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpiresIn: Date,
    dateEmailVerified: {
      type: Date,
      timestamp: true,
      default: null,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.plugin(runValidators);

//Validate Age
userSchema.pre("save", async function (next) {
  const today = new Date();
  const birthdate = this.birthdate;
  const year_difference = today.getFullYear() - birthdate.getFullYear();
  const one_or_zero =
    today.getMonth() < birthdate.getMonth() ||
    (today.getMonth() === birthdate.getMonth() &&
      today.getDate() < today.getDate())
      ? 1
      : 0;
  const age = year_difference - one_or_zero;
  if (age < 13) {
    return next(
      new AppError(
        `You must be at least 13 years old to create an account!`,
        400
      ),
      400
    );
  } else {
    return next();
  }
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(`${this.password}`, 12);
    this.confirmPassword = undefined;
    next();
  }
  next();
});

userSchema.methods.createEmailVerificationToken = function () {
  const randomEmailVerificationToken = crypto.randomBytes(4).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(randomEmailVerificationToken)
    .digest("hex");
  this.emailVerificationTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return randomEmailVerificationToken;
};


userSchema.methods.updateUserVerificationStatus = function(){
  this.emailVerified = true
  this.dateEmailVerified = Date.now()
  this.emailVerificationToken = undefined
  this.emailVerificationTokenExpiresIn = undefined
  return this
}
const User = mongoose.model("User", userSchema);

module.exports = User;
