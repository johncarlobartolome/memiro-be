const { log } = require("console");
const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

const jwtSign = (id) => {
  return jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const {
    email,
    phone,
    firstName,
    lastName,
    birthdate,
    gender,
    password,
    status,
    confirmPassword,
  } = req.body;

  const newUser = await User.create({
    email,
    firstName,
    lastName,
    birthdate,
    gender,
    password,
    confirmPassword,
    status,
  });

  return res.status(201).json({ status: "success", data: { user: newUser } });
});
exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  const freshUser = await User.findOne({ email }).select("+password");
  if (!email || !password) {
    return next(new AppError(`Please fill in email and password`, 400));
  }

  // await user.select('+password')
  if (!(await freshUser.comparePassword(password, freshUser.password)) || !freshUser) {
    return next(new AppError(`Invalid email or password`, 400));
  }

  const token = jwtSign(freshUser.id);
  req.user = freshUser
  return res
    .status(200)
    .json({ status: "success", token, message: "user logged in" });
});
