const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipienteCharterSchema = new Schema(
  {
    // id: {
    //   type: Number,
    //   required: [true, "id is required"],
    //   unique: [true, "id must be unique"],
    // },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      trim: true,
    },
    data_provider: {
      type: String,
      required: [true, "Data provider is required"],
      minlength: [3, "Data provider is too short"],
      maxlength: [32, "Data provider is too long"],
    },
    country: {
      type: String,
      required: true,
      enum: [
        "United States",
        "Canada",
        "United Kingdom",
        "France",
        "Germany",
        "Australia",
        "India",
        "China",
        "Japan",
        "Brazil",
      ],
      minlength: [2, "Country name is too short"],
      maxlength: [56, "Country name is too long"],
    },
    email_type: {
      type: String,
      required: [true, "Email type is required"],
      enum: {
        values: ["fresh", "clean", "opener", "clicker", "leader"],
        message: "{VALUE} is not a valid email type",
      },
    },
  },
  { timestamps: true }
);

// const Recipiente_Charter = mongoose.model(
//   "Recipiente_Charter",
//   recipienteCharterSchema
// );

// Prevent model overwrite
const Recipiente_Charter =
  mongoose.models.Recipiente_Charter ||
  mongoose.model("Recipiente_Charter", recipienteCharterSchema);

module.exports = Recipiente_Charter;
