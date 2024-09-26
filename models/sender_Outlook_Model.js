const { default: mongoose } = require("mongoose");
const shema = mongoose.Schema;

const senderOutlookShema = new shema(
  {
    // id: {
    //   type: Number,
    //   require: [true, "id required"],
    //   unique: [true, "id must be unique"],
    // },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"], // Ensures that the email is unique in the database
      lowercase: true, // Converts the email to lowercase
      trim: true, // Removes any leading or trailing spaces
      // match: [
      //   /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      //   "Please enter a valid email address",
      // ], // Validates the email format using a regex
    },
    app_password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [128, "Password must be less than 128 characters"],
      // Optional custom validator for complexity (e.g., includes letters, numbers, special characters)
      // validate: {
      //   validator: function (value) {
      //     return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      //   },
      //   message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      // },
    },
  },
  { timestamps: true }
);

// const SenderOutlook = mongoose.model("Sender_Gmail", senderOutlookShema);
// module.exports = SenderOutlook;

const SenderOutlook =
  mongoose.models.SenderOutlook ||
  mongoose.model("SenderOutlook", senderOutlookShema);

module.exports = SenderOutlook;
