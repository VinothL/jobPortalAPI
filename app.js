const express = require("express");
const dotenv = require("dotenv");

//Loading the initial configuration
const app = express();
dotenv.config({ path: "./config/config.env" });

//Handling the uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught Exceptions");
  process.exit(1);
});

// Setup body parser
app.use(express.json());

//Loading the error handler middleware
const errorMiddleware = require("./middleware/errors");

//Importing the database connection
const dbConnect = require("./config/database");
dbConnect();

//Importing all the routes
const jobs = require("./routes/jobs");
const ErrorHandler = require("./utils/errorHandler");

//using the routes
app.use("/api/v1", jobs);

//Handle all the unavailable routes
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

app.use(errorMiddleware);

//Starting the server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(
    `Server started at the port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});

//Handling the unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error :, ${err.message}`);
  console.log("Shutting down the server due to unhandledRejection");
  server.close(() => {
    process.exit(1);
  });
});
