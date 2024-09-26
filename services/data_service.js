const expressAsyncHandler = require("express-async-handler");
const Recipiente_Charter = require("../models/recipiente_Charter_Model");
const Recipiente_RR = require("../models/recipiente_RR_Model");
const SenderGmail = require("../models/sender_Gmail_Model");
const ApiError = require("../utils/apiError");

// Add all your models in this object
let models = {
  Recipiente_Charter_1: Recipiente_Charter,
  Recipiente_RR_1: Recipiente_RR,
  SenderGmail_1: SenderGmail,
};

// Get data by ISP & COUNTRY
const getDataByISP = expressAsyncHandler(async function (req, res, next) {
  const { isp, country, email_type } = req.body;
  let result = []; // Array to hold the results

  if (isp) {
    // Loop through all the models
    for (const [modelName, model] of Object.entries(models)) {
      // Check if the model name includes the given ISP keyword (e.g., Charter, RR, Gmail)
      if (modelName.toLowerCase().includes(isp.toLowerCase())) {
        const queryCriteria = {}; // Dynamic query object

        if (country) {
          queryCriteria.country = country; // Add country to the query if provided
        }

        if (email_type && email_type.length > 0) {
          queryCriteria.email_type = { $in: email_type }; // Add email_type to the query if provided
        }

        // Get the count of matching records
        const recordCount = await model.find(queryCriteria).countDocuments();
        result.push([modelName, recordCount]); // Add to the result array
      }
    }

    if (result.length > 0) {
      res.json(result); // Return the result array if there are matches
    } else {
      return next(
        new ApiError(`No matching models found for the given ISP: ${isp}`)
      );
    }
  } else {
    return next(new ApiError("ISP not provided"));
  }
});

module.exports = { getDataByISP };
