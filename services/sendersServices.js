const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const SenderGmail = require("../models/sender_Gmail_Model");
const SenderOutlook = require("../models/sender_Outlook_Model");
const Recipiente_Charter = require("../models/recipiente_Charter_Model");
const Recipiente_RR = require("../models/recipiente_RR_Model");
const { dataNames } = require("../config/connect");
const { toTitleCase } = require("../utils/toTitleCase");

//GET All Senders By Name
const getAllSenders = expressAsyncHandler(async function (req, res) {
  const { isp } = req.params;
  let emails = [];
  if (isp == "gmail") {
    emails = await SenderGmail.find(
      {},
      { _id: false, email: true, app_password: true }
    );
  } else if (isp == "outlook") {
    emails = await SenderOutlook.find(
      {},
      { _id: false, email: true, app_password: true }
    );
  }
  res.status(200).json({ emails });
});

const getAllSendersCount = expressAsyncHandler(async function (req, res) {
  try {
    const gmailCount = await SenderGmail.countDocuments();
    const outlookCount = await SenderOutlook.countDocuments();
    const totalCount = gmailCount + outlookCount;

    res.status(200).json({
      counts: {
        gmail: gmailCount,
        outlook: outlookCount,
        total: totalCount,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sender counts", error: error.message });
  }
});

// ADD Data
const addData = expressAsyncHandler(async function (req, res, next) {
  const { isp } = req.params;
  const { dataType } = req.body;

  // Validate input for both `isp` and `dataType`
  if (!isp || !dataType) {
    return next(new ApiError("Missing required fields: ISP or DataType"));
  }

  // Helper function to handle unsupported ISP
  const handleUnsupportedIsp = () =>
    next(new ApiError(`ISP "${isp}" not supported`));

  // Define a map for ISP to functions
  const addFunctionsMap = {
    Recipients: {
      CHARTER: () => addRecipienteFunc(req, res, Recipiente_Charter),
      RR: () => addRecipienteFunc(req, res, Recipiente_RR),
    },
    Senders: {
      GMAIL: () => addSendersFunc(req, res, SenderGmail),
      OUTLOOK: () => addSendersFunc(req, res, SenderOutlook),
    },
  };

  // Determine which function to use based on dataType and isp
  if (dataType === "Recipients") {
    if (addFunctionsMap.Recipients[isp]) {
      return addFunctionsMap.Recipients[isp]();
    } else {
      return handleUnsupportedIsp();
    }
  } else if (dataType === "Senders") {
    if (addFunctionsMap.Senders[isp]) {
      return addFunctionsMap.Senders[isp]();
    } else {
      return handleUnsupportedIsp();
    }
  } else {
    return next(new ApiError("Invalid dataType provided"));
  }
});

//add senders
const addSendersFunc = async function (req, res, Model) {
  const { emails } = req.body;

  try {
    // Array to store bulk operations
    const bulkOps = [];

    // Loop through the array and process each user
    for (const user of emails) {
      // Get the next auto-incremented id

      // Prepare bulk update operation with upsert
      bulkOps.push({
        updateOne: {
          filter: { email: user.email }, // Match by email
          update: {
            $set: {
              app_password: user.password,
            },
          },
          upsert: true, // Insert if not found
        },
      });
    }

    // Perform the bulk operation
    if (bulkOps.length > 0) {
      const bulkWriteResult = await Model.bulkWrite(bulkOps);
      console.log(
        `Bulk operation completed. Matched: ${bulkWriteResult.matchedCount}, Modified: ${bulkWriteResult.modifiedCount}, Upserted: ${bulkWriteResult.upsertedCount}`
      );
    }

    res.status(200).send({ message: "Users added or updated successfully" });
  } catch (error) {
    console.error("Error adding users:", error);
    res.status(500).send({ message: "Error adding users", error });
  }
};

//add Recipientes
const addRecipienteFunc = async function (req, res, Model) {
  const { emails, mydataProvider, mycountry, myInitialEmailsType } = req.body;

  try {
    // Array to store bulk operations
    const bulkOps = [];

    // Loop through the emails and prepare each bulk operation
    for (const email of emails) {
      const trimmedEmail = email.trim(); // Trim each email

      // Prepare bulk update operation with upsert
      bulkOps.push({
        updateOne: {
          filter: { email: trimmedEmail }, // Match by email
          update: {
            $setOnInsert: {
              email: trimmedEmail, // Add the email if it's new
              data_provider: mydataProvider, // Add other properties
              country: mycountry,
              email_type: myInitialEmailsType,
            },
          },
          upsert: true, // Insert if not found
        },
      });
    }

    // Perform the bulk operation
    if (bulkOps.length > 0) {
      const bulkWriteResult = await Model.bulkWrite(bulkOps);
      console.log(
        `Bulk operation completed. Matched: ${bulkWriteResult.matchedCount}, Modified: ${bulkWriteResult.modifiedCount}, Upserted: ${bulkWriteResult.upsertedCount}`
      );
    }

    res.status(200).send({ message: "Users added or updated successfully" });
  } catch (error) {
    console.error("Error adding users:", error);
    res.status(500).send({ message: "Error adding users", error });
  }
};

//get all data
const getAllData = expressAsyncHandler(async function addUsers(req, res) {
  myDataNames = dataNames.filter(function (e) {
    return !e.endsWith("counters");
  });
  myDataNames = myDataNames.map(function (e) {
    return toTitleCase(e);
  });

  res.json({ data: myDataNames });
});

module.exports = { getAllSenders, addData, getAllData, getAllSendersCount };
