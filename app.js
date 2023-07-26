const express = require("express");
require("dotenv").config();
const router = require("./src/routes");
const cors = require("cors");
const createError = require("http-errors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.httpCode || 500).json({ message: err.message });
});

app.get("/", (req, res) => {
  res.send("Hello There!");
});

app.listen(port, () => { console.log(`Server is listening on port ${port}`); });