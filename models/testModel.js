const mongoose = require("mongoose");

// Define the schema for the Test model
const testSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now, // Use the current date and time by default
    },
    mailer: {
      type: String,
      required: true,
    },
    isp: {
      type: String,
      required: true,
    },
    offer: {
      type: String,
      required: true,
    },
    affiliate_network: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    opens: {
      type: Number,
      default: 0, // Default value for opens
    },
    clicks: {
      type: Number,
      default: 0, // Default value for clicks
    },
  },
  { timestamps: true }
);

// Create the Test model using the schema
const Test = mongoose.model("Test", testSchema);

// Export the model
module.exports = Test;
