const express = require("express");
const {
  getAllSenders,
  addData,
  getAllData,
} = require("../services/sendersServices");
const router = express.Router();

router.route("/:isp").get(getAllSenders).post(addData);

router.route("/").get(getAllData);

module.exports = router;
