const express = require("express");
const {
  getDropByCampaignName,
  getAllDrops,
} = require("../services/dropService");
const router = express.Router();

router.route("/:campaignName").get(getDropByCampaignName);
router.route("/").get(getAllDrops);

module.exports = router;
