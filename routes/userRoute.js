const express = require("express");

const router = express.Router();

const {
  signUp,
  sendVerificationCode,
  verifyEmail,
} = require("./../controllers/authController");

router.post("/signup", signUp, sendVerificationCode);
// router.post("/verify", sendVerificationCode);
router.get("/verify/:code", verifyEmail);

module.exports = router;
