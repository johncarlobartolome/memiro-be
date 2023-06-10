const { log } = require("console");
const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const moment = require("moment");

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
  if (!email || !password) {
    return next(new AppError(`Please fill in email and password`, 400));
  }
  const freshUser = await User.findOne({ email: email }).select("+password");

  if (!freshUser.emailVerified) {
    //send verification
    // return next()
  }

  if (freshUser.status != "active") {
    //send activation
    // return next()
  }

  if (freshUser.status === "disabled") {
    if (freshUser.loginDisabledTimestamp <= Date.now()) {
      freshUser.loginAttempt = 0;
      freshUser.loginDisabledTimestamp = undefined;
      freshUser.status = "active";
      await freshUser.save({ validateBeforeSave: false });
    }
  }

  if (freshUser.loginAttempt >= 5) {
    if (freshUser.status === "active") {
      freshUser.status = "disabled";
      freshUser.loginDisabledTimestamp = Date.now() + 5 * 60 * 1000;
      await freshUser.save({ validateBeforeSave: false });
      return next(
        new AppError(`Please wait 5 minutes before you can login again`, 401)
      );
    } else {
      const minuteRaw = (freshUser.loginDisabledTimestamp - Date.now()) / 60000;
      const minute = Math.floor(minuteRaw);
      const minuteMessage =
        minute === 0
          ? ""
          : minute > 1
          ? `${minute} minutes and `
          : `1 minute and `;
      const seconds = Math.floor(60 * (minuteRaw - minute));
      return next(
        new AppError(
          `Please wait ${minuteMessage}${seconds} seconds before you can login again`,
          401
        )
      );
    }
  }
  const checkPassword = await freshUser.comparePassword(
    password,
    freshUser.password
  );

  if (!checkPassword || !freshUser) {
    if (!checkPassword) {
      freshUser.loginAttempt = freshUser.loginAttempt + 1;
      await freshUser.save({ validateBeforeSave: false });
    }
    return next(new AppError(`Invalid email or password`, 400));
  }

  const token = jwtSign(freshUser.id);

  freshUser.loginAttempt = 0;
  freshUser.loginDisabledTimestamp = undefined;
  freshUser.status = "active";
  await freshUser.save({ validateBeforeSave: false });

  req.user = freshUser;
  return res
    .status(200)
    .json({ status: "success", token, message: "user logged in" });
});
