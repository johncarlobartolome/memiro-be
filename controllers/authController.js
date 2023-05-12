const { log } = require("console");
const User = require("./../models/userModel");

exports.signUp = async (req, res) => {
  try {
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

    if (password !== confirmPassword) {
      throw new Error("Password does not match");
    }

    if (phone.startsWith("09") && phone.length === 11) {
      const newUser = await User.create({
        email,
        phone,
        firstName,
        lastName,
        birthdate,
        gender,
        password,
        status,
      });

      return res
        .status(201)
        .json({ status: "success", data: { user: newUser } });
    } else {
      throw new Error("Invalid phone number");
    }
  } catch (error) {
    log(error);
    return res.send(error);
  }
};
