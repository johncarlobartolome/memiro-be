const express = require("express");
const app = express();
const homeRoute = require("./routes/homeRoute");
const userRoute = require("./routes/userRoute");

const morgan = require("morgan");

app.use(express.json());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use("/", homeRoute);
app.use("/users/", userRoute);

module.exports = app;
