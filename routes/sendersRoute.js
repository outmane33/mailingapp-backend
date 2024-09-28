const express = require("express");
const {
  getAllSenders,
  addData,
  getAllData,
  getAllSendersCount,
} = require("../services/sendersServices");
const router = express.Router();
router.route("/senders/Count").get(getAllSendersCount);
router.route("/:isp").get(getAllSenders).post(addData);
router.route("/").get(getAllData);

module.exports = router;
