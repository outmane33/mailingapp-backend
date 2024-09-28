const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Test = require("../models/testModel");

const getAllTests = expressAsyncHandler(async function (req, res) {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  // Build filter query object based on the request parameters
  let filter = {};
  if (req.query.campaignName) {
    filter.campaignName = { $regex: req.query.campaignName, $options: "i" }; // case-insensitive
  }
  if (req.query.isp) {
    filter.isp = req.query.isp;
  }
  if (req.query.opens) {
    filter.opens = req.query.opens;
  }
  if (req.query.clicks) {
    filter.clicks = req.query.clicks;
  }
  if (req.query.mailer) {
    filter.mailer = { $regex: req.query.mailer, $options: "i" }; // case-insensitive
  }
  if (req.query.offer) {
    filter.offer = { $regex: req.query.offer, $options: "i" }; // case-insensitive
  }

  if (req.query.affiliate_network) {
    filter.affiliate_network = {
      $regex: req.query.affiliate_network,
      $options: "i",
    }; // case-insensitive
  }

  // Get the total count of filtered tests
  const totalTests = await Test.countDocuments(filter);

  // Calculate total number of pages based on the filtered results
  const totalPages = Math.ceil(totalTests / limit);

  // Fetch the paginated and filtered tests
  const tests = await Test.find(filter).skip(skip).limit(limit);

  // Respond with result, current page, total pages, and filtered data
  res.status(200).json({
    result: tests.length,
    page,
    totalPages,
    totalTests,
    data: tests,
  });
});

const getCountTestToday = expressAsyncHandler(async function (req, res) {
  try {
    // Get the start and end of today in the server's timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count documents created between start of today and start of tomorrow
    const count = await Test.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching today's Test count",
      error: error.message,
    });
  }
});

module.exports = { getAllTests, getCountTestToday };
