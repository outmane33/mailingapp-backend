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
  if (req.query.campaignName) {
    filter.campaignName = { $regex: req.query.campaignName, $options: "i" }; // case-insensitive
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

module.exports = { getDropByCampaignName, getAllDrops };
