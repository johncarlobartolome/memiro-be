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

  const checkUser = (candidateLastName) => {
    if (candidateLastName === lastName) {
      return next(
        new AppError(`This user already exist: ${firstName} ${lastName}!`, 400)
      );
    }
  };

  log("stillhere");
  const allUsers = await User.find({ firstName });
  if (allUsers) {
    Object.values(allUsers).map((el) => checkUser(el.lastName));
    Object.values(allUsers).map((el) => log(el.phone));
  }
  const newUser = await User.create({
    email,
    phone,
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
