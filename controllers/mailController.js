const User = require("../models/userModel");
const fs = require("fs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const { log } = require("console");
const handlebars = require("handlebars")

const path = require("path")
exports.sendVerificationEmail = async (email, token) => {

  handlebars.registerHelper("link", function(text, url) {

    var url = handlebars.escapeExpression(url),
        text = handlebars.escapeExpression(text)
   return new handlebars.SafeString("<a id='link-verify' href='" + url + "'>" + text +"</a>");

  });

  handlebars.registerHelper("link1", function(text, url) {
    var url = handlebars.escapeExpression(url),
        text = handlebars.escapeExpression(text)
   return new handlebars.SafeString("<a href='" + url + "'>" + text +"</a>");

  });




  const user = await User.findOne({ email: email });

  // let verifyHtmlTemplate = fs.readFileSync(

  //   `${__dirname}/../public/verifyEmailTemplate.html`,

  //   "utf-8"

  // );

  const templatePath = path.join(__dirname, "../public/verifyEmailTemplate.hbs")

  const emailTemplateSource = fs.readFileSync(templatePath, "utf8")

  // verifyHtmlTemplate = verifyHtmlTemplate.replace(

  //   /{{link}}/g,

  //   `127.0.0.1:3000/verify/${token}`

  // );




  const template = handlebars.compile(emailTemplateSource)

  const htmlToSend = template({url: `${process.env.EMAIL_LINK}/${token}`})




  let transporter = nodemailer.createTransport({

    service: process.env.EMAIL_SERVICE, // true for 465, false for other ports

    auth: {

      user: process.env.EMAIL_USERNAME, // generated ethereal user

      pass: process.env.EMAIL_PASSWORD, // generated ethereal password

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

    from: `${process.env.EMAIL_SENDER} <${process.env.EMAIL_USERNAME}>`, // sender address

    to: `${email}`, // list of receivers

    subject: "Email Verification", // Subject line

    text: "", // plain text body

    html: htmlToSend, // html body

  });

};