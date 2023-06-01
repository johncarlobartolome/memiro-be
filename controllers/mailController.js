const User = require("../models/userModel");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const AppError = require("../utils/appError");
const { log } = require("console");

exports.sendVerificationEmail = async (email,token) => {
  //templating html
  const user = await User.findOne({email:email})
  log(user.emailVerificationToken)
  let verifyHtmlTemplate = fs.readFileSync(
    `${__dirname}/../public/verifyEmailTemplate.html`,
    "utf-8"
  );
  verifyHtmlTemplate = verifyHtmlTemplate.replace(
    /{{link}}/g,
    `127.0.0.1:3000/verify/${token}`
  );

  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      return next(
        new AppError(`Unable to send verification, Please try again later`, 500)
      );
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  await transporter.sendMail({
    from: '"MEMIRO" <memiro@memiro.io>', // sender address
    to: `"${email}"`, // list of receivers
    subject: "Email Verification", // Subject line
    text: "Hello world?", // plain text body
    html: `${verifyHtmlTemplate}`, // html body
  });
};
