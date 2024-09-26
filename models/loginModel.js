const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the login schema
const loginSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true, // Make user_name required
    unique: true, // Ensure usernames are unique
    trim: true, // Trim whitespace from the input
    minlength: 3, // Minimum length for user_name
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Invalid email address"], // Simple email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to hash the password before storing it in the database
loginSchema.pre("save", async function (next) {
  const user = this;

  // Only hash the password if it has been modified or is new
  if (!user.isModified("password")) return next();

  // Generate salt and hash password
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for authentication
loginSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema
const Login = mongoose.model("Login", loginSchema);

module.exports = Login;
