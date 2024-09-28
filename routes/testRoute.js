const express = require("express");
const { getAllTests, getCountTestToday } = require("../services/testService");

const router = express.Router();

router.get("/", getAllTests);
router.get("/count/today", getCountTestToday);

module.exports = router;
