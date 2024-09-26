const express = require("express");
const {
  sendTest,
  sendDrop,
  pauseCampaign,
  resumeCampaign,
  stopCampaign,
} = require("../services/send_Service");
const router = express.Router();

router.route("/test").post(sendTest);
router.route("/drop").post(sendDrop);
router.route("/pauseCampaign").post(pauseCampaign);
router.route("/resumeCampaign").post(resumeCampaign);
router.route("/stopCampaign").post(stopCampaign);

module.exports = router;
