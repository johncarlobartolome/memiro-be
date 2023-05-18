const { log } = require("console");
const AppError = require("../utils/appError");
const handleCastError = (err) => {
  return new AppError(`Can't find data with ${err.path}:${err.value}!`);
};
const handleDuplicateError = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  return new AppError(
    `Field already exist: ${value}! Please try another.`,
    400
  );
};
const handleValidationError = (err) => {
  const values = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Filled data already exist: ${values}`, 400);
};
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res
      .status(500)
      .json({ status: "success", message: "Something went wrong!" });
  }
};

module.exports = (err, req, res, next) => {
  log(err.name, err.stack, err.message);
  (err.status = err.status || "error"),
    (err.statusCode = err.statusCode || 500);
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }
  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.code === 11000) error = handleDuplicateError(error);
    if (err.name === "ValidationError") error = handleValidationError(error);
    if (err.name === "CastError") Error = handleCastError(error);
    sendErrorProd(error, res);
  }
};
