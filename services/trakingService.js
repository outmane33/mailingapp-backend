const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Recipiente_RR = require("../models/recipiente_RR_Model");
const Recipiente_Charter = require("../models/recipiente_Charter_Model");

// Helper function to determine the model based on campaign
const getRecipientModel = (campaign) => {
  if (campaign.startsWith("rr")) {
    return Recipiente_RR;
  } else if (campaign.startsWith("charter")) {
    return Recipiente_Charter;
  } else {
    return null; // Invalid campaign
  }
};

// Helper function to handle email_type updates
const updateEmailType = async (model, email, type, excludeTypes = []) => {
  const excludeConditions = excludeTypes.map((t) => ({
    email_type: { $ne: t },
  }));
  await model.updateOne(
    {
      email: email,
      $and: excludeConditions,
    },
    { email_type: type }
  );
};

const trackOpen = expressAsyncHandler(async function (req, res, next) {
  const { email, campaign } = req.query;

  if (!email || !campaign) {
    return next(new ApiError("Missing email or campaign parameters", 400));
  }

  console.log(`Email opened by: ${email}, for campaign: ${campaign}`);

  const recipientModel = getRecipientModel(campaign);

  if (!recipientModel) {
    return next(new ApiError("Invalid campaign specified", 400));
  }

  // Update the email_type to "opener" if it's not already "leader" or "clicker"
  await updateEmailType(recipientModel, email, "opener", ["leader", "clicker"]);

  // Return a 1x1 transparent pixel (tracking pixel)
  res.setHeader("Content-Type", "image/png");
  res.send(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/ao8KYkAAAAASUVORK5CYII=",
      "base64"
    )
  );
});

const trackClick = expressAsyncHandler(async function (req, res, next) {
  const { email, campaign, destination } = req.query;

  if (!email || !campaign || !destination) {
    return next(
      new ApiError("Missing email, campaign, or destination parameters", 400)
    );
  }

  console.log(
    `Click from: ${email}, Campaign: ${campaign}, Redirecting to: ${destination}`
  );

  const recipientModel = getRecipientModel(campaign);

  if (!recipientModel) {
    return next(new ApiError("Invalid campaign specified", 400));
  }

  // Update the email_type to "clicker" if it's not already "leader"
  await updateEmailType(recipientModel, email, "clicker", ["leader"]);

  // Redirect the user to the actual destination
  res.redirect(destination);
});

module.exports = { trackOpen, trackClick };
