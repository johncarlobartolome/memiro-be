const { log } = require("console");
const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
