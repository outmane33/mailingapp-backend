const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Login = require("../models/loginModel");
const jwt = require("jsonwebtoken");

// Secret key for signing the JWT
const JWT_SECRET = "your_jwt_secret"; // Keep this secret and secure!

// Helper function to generate JWT
function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h", // Token will expire in 1 hour
  });
}

const login = expressAsyncHandler(async function (req, res, next) {
  try {
    const { email, password } = req.body; // Destructure email and password from the request body
    const user = await Login.findOne({ email });

    if (!user) {
      return next(new ApiError("User not found", 400));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ApiError("Invalid password", 400));
    }

    // Generate a JWT token for the user
    const token = generateToken(user);

    // Send the user_name and token as part of the response
    res.json({
      message: "Login successful",
      token,
      user_name: user.user_name, // Include the user_name in the response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const register = expressAsyncHandler(async function (req, res, next) {
  try {
    const { email, password, user_name } = req.body; // Destructure user_name, email, and password from the request body

    // Check if user_name already exists (since it is unique)
    const existingUser = await Login.findOne({ user_name });
    if (existingUser) {
      return next(new ApiError("Username already exists", 400));
    }

    // Create a new user with email, password, and user_name
    const newUser = new Login({ email, password, user_name });
    await newUser.save();

    // Generate a JWT token for the new user
    const token = generateToken(newUser);

    // Send the token as part of the response
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { login, register };
