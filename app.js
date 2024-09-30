const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const morgan = require("morgan");
const cors = require("cors");
const { dbConnection } = require("./config/connect");
const globalError = require("./middlewares/golbalError");
const testRoute = require("./routes/testRoute");
const send_Router = require("./routes/send_Router");
const sendersRoute = require("./routes/sendersRoute");
const data_Router = require("./routes/data_Router");
const dropRouter = require("./routes/dropRouter");
const loginRouter = require("./routes/loginRouter");
const trakingRoute = require("./routes/trakingRoute");

// Initialize the Express app
const app = express();

// Database connection
dbConnection();

// Enable CORS for your Angular frontend
// {
//   origin: "http://localhost:4200", // Your frontend app
//   methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
//   allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
// }
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);
// Compress all responses
const compression = require("compression");
app.use(compression());

// Middleware to parse large payloads (use express built-in JSON body parsing)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logging requests in development mode
if (process.env.NODE_ENV === "development") {
  console.log(`Node_env: ${process.env.NODE_ENV}`);
  app.use(morgan("dev"));
}

// Routes
app.use("/test", testRoute);
app.use("/boites", sendersRoute);
app.use("/send", send_Router);
app.use("/data", data_Router);
app.use("/drop", dropRouter);
app.use("/connect", loginRouter);

// Tracking pixel route
app.use("/tracking", trakingRoute);

// Handle all other routes (404 errors)
app.all("*", (req, res, next) => {
  next(new ApiError(`Cannot find this route: ${req.originalUrl}`, 400));
});

// Global Error Handler
app.use(globalError);

// Start server on specified port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g., database connection issues)
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down...");
    process.exit(1);
  });
});
