const express = require("express");
const {
  getDropByCampaignName,
  getAllDrops,
  getCountDropsToday,
  getDailyDelivred,
  getDailyClicks,
  getMonthlyClicks,
} = require("../services/dropService");
const router = express.Router();

router.route("/").get(getAllDrops);
router.route("/:campaignName").get(getDropByCampaignName);
router.route("/count/today").get(getCountDropsToday);
router.route("/count/delivredToday").get(getDailyDelivred);
router.route("/count/clicksToday").get(getDailyClicks);
router.route("/count/clicksMonth").get(getMonthlyClicks);

module.exports = router;
