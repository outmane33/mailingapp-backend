const express = require("express");
const { trackOpen, trackClick } = require("../services/trakingService");
const router = express.Router();

router.route("/open").get(trackOpen);
router.route("/click").get(trackClick);

module.exports = router;
