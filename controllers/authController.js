const { log } = require("console");
const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const hbs = require('nodemailer-express-handlebars')
const crypto = require("crypto");

const { sendMail, sendVerificationEmail } = require("./mailController");
exports.signUp = catchAsync(async (req, res, next) => {
  const {
    email,
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

  // return res.status(201).json({ status: "success", data: { user: newUser } });
  next();
});

exports.sendVerificationCode = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please input email address", 401));
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new AppError(`Invalid email. Please try another`, 404));
  }

  const myemailId = email;
  var maskId = myemailId.replace(
    /^(.)(.*)(.@.*)$/,
    (_, a, b, c) => a + b.replace(/./g, "*") + c
  );

  if (user.emailVerified) {
    return next(
      new AppError(
        "Email is already verified. Please proceed logging in your account",
        401
      )
    );
  }

  const emailVerificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  sendVerificationEmail(email, emailVerificationToken);

  return res.status(200).json({
    status: "success",
    message: `We have sent a verification email to ${maskId}. You need to  verify your email address in order to login to memiro`,
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const candidateVerificationCode = crypto
    .createHash("sha256")
    .update(req.params.code)
    .digest("hex");

  //FIND USER BASED ON EMAIL CODE(CRYPTO)
  const user = await User.findOne({
    emailVerificationToken: candidateVerificationCode,
  });
  if (!user) {
    return next(new AppError("Invalid verification code!", 401));
  }
  if (user.emailVerificationTokenExpiresIn < Date.now()) {
    return next(new AppError("Verification code is expired!", 401));
  }
  await user.updateUserVerificationStatus();
  await user.save({ validateBeforeSave: false });
  return res.status(200).json({
    status: "success",
    message: "Email verification successful!",
  });
});
