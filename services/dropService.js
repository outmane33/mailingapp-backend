const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Drop = require("../models/drop_Model");

//GET
//get drop by CampaignName
const getDropByCampaignName = expressAsyncHandler(async function (req, res) {
  let { campaignName } = req.params;

  const drop = await Drop.find({ campaignName });
  if (!drop) {
    return next(
      new ApiError(`no drop for this campaignName: ${campaignName}`, 404)
    );
  }
  res.status(200).json({ drop });
});

//GET
//get all drops
const getAllDrops = expressAsyncHandler(async function (req, res) {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  // Build filter query object based on the request parameters
  console.log(req.query);
  let filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.startFrom) {
    filter.startFrom = req.query.startFrom;
  }
  if (req.query.total) {
    filter.total = req.query.total;
  }
  if (req.query.lastStartIndex) {
    filter.lastStartIndex = req.query.lastStartIndex;
  }
  if (req.query.opens) {
    filter.opens = req.query.opens;
  }
  if (req.query.clicks) {
    filter.clicks = req.query.clicks;
  }
  if (req.query.leads) {
    filter.leads = req.query.leads;
  }
  if (req.query.unsubs) {
    filter.unsubs = req.query.unsubs;
  }
  if (req.query.campaignName) {
    filter.campaignName = { $regex: req.query.campaignName, $options: "i" }; // case-insensitive
  }
  if (req.query.mailer) {
    filter.mailer = { $regex: req.query.mailer, $options: "i" }; // case-insensitive
  }
  if (req.query.offer) {
    filter.offer = { $regex: req.query.offer, $options: "i" }; // case-insensitive
  }
  if (req.query.isp) {
    filter.isp = req.query.isp;
  }
  if (req.query.dataListName) {
    filter.dataListName = { $regex: req.query.dataListName, $options: "i" }; // case-insensitive
  }

  // Get the total count of filtered drops
  const totalDrops = await Drop.countDocuments(filter);

  // Calculate total number of pages based on the filtered results
  const totalPages = Math.ceil(totalDrops / limit);

  // Fetch the paginated and filtered drops
  const drops = await Drop.find(filter).skip(skip).limit(limit);

  // Respond with result, current page, total pages, and filtered data
  res.status(200).json({
    result: drops.length,
    page,
    totalPages,
    totalDrops,
    data: drops,
  });
});

//get all drops count for today
const getCountDropsToday = expressAsyncHandler(async function (req, res) {
  try {
    // Get the start and end of today in the server's timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count documents created between start of today and start of tomorrow
    const count = await Drop.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching today's drop count",
      error: error.message,
    });
  }
});

//get lastStartIndex for today
const getDailyDelivred = expressAsyncHandler(async function (req, res) {
  try {
    // Get the start and end of today in the server's timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Use aggregation to sum lastStartIndex for documents created today
    const result = await Drop.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalLastStartIndex: { $sum: "$lastStartIndex" },
        },
      },
    ]);

    // Check if there are any results
    const totalLastStartIndex =
      result.length > 0 ? result[0].totalLastStartIndex : 0;

    res.status(200).json({ totalLastStartIndex });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating total lastStartIndex",
      error: error.message,
    });
  }
});

//daily clicks
const getDailyClicks = expressAsyncHandler(async function (req, res) {
  try {
    // Get the start and end of today in the server's timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Use aggregation to sum clicks for documents created today
    const result = await Drop.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
        },
      },
    ]);

    // Check if there are any results
    const totalClicks = result.length > 0 ? result[0].totalClicks : 0;

    res.status(200).json({ totalClicks });
  } catch (error) {
    res.status(500).json({
      message: "Error calculating total clicks",
      error: error.message,
    });
  }
});

//monthly clicks
const getMonthlyClicks = expressAsyncHandler(async function (req, res) {
  try {
    // Get the start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get the start of the next month
    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    // Use aggregation to sum clicks for documents created this month
    const result = await Drop.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
        },
      },
    ]);

    // Check if there are any results
    const totalClicks = result.length > 0 ? result[0].totalClicks : 0;

    res.status(200).json({
      totalClicks,
      month: startOfMonth.toLocaleString("default", { month: "long" }),
      year: startOfMonth.getFullYear(),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error calculating total clicks for the month",
        error: error.message,
      });
  }
});

module.exports = {
  getDropByCampaignName,
  getAllDrops,
  getCountDropsToday,
  getDailyDelivred,
  getDailyClicks,
  getMonthlyClicks,
};
