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

// Get all data info
const getAllData = expressAsyncHandler(async function (req, res, next) {
  try {
    const {
      data_provider,
      Name,
      Total_Count,
      Updated_At,
      Created_Date,
      page = 1,
      limit = 5,
    } = req.query;

    const skip = (page - 1) * limit;
    const allData = {};
    let totalItems = 0;

    for (const [modelName, Model] of Object.entries(models)) {
      // Prepare filter for aggregation
      let matchStage = {};
      if (data_provider) matchStage.data_provider = data_provider;
      if (Updated_At) matchStage.updatedAt = { $gte: new Date(Updated_At) };
      if (Created_Date) matchStage.createdAt = { $gte: new Date(Created_Date) };

      // Group by data_provider and count documents
      const countsByProvider = await Model.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$data_provider",
            count: { $sum: 1 },
            latestCreatedAt: { $max: "$createdAt" },
            latestUpdate: { $max: "$updatedAt" },
          },
        },
        { $sort: { latestCreatedAt: -1 } },
      ]);

      // Transform and filter the results
      countsByProvider.forEach((provider) => {
        const providerName = provider._id || "Unknown";
        const entry = {
          DataProvider: providerName,
          Name: modelName,
          Total_Count: provider.count,
          Updated_At: provider.latestUpdate
            ? provider.latestUpdate.toISOString()
            : "N/A",
          Created_Date: provider.latestCreatedAt
            ? provider.latestCreatedAt.toISOString()
            : "N/A",
        };

        // Apply filters
        if (
          (!Name || modelName.includes(Name)) &&
          (!Total_Count || provider.count >= parseInt(Total_Count))
        ) {
          allData[`${modelName}_${providerName}`] = entry;
          totalItems++;
        }
      });

      // If no documents exist for this model, add an entry with zero count
      if (
        countsByProvider.length === 0 &&
        (!Name || modelName.includes(Name))
      ) {
        allData[modelName] = {
          DataProvider: "N/A",
          Name: modelName,
          Total_Count: 0,
          Updated_At: "N/A",
          Created_Date: "N/A",
        };
        totalItems++;
      }
    }

    // Apply pagination
    const paginatedData = Object.fromEntries(
      Object.entries(allData).slice(skip, skip + parseInt(limit))
    );

    res.status(200).json({
      success: true,
      data: paginatedData,
      pagination: {
        totalItems,
        itemsPerPage: parseInt(limit),
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});
module.exports = { getDataByISP, getAllData };
