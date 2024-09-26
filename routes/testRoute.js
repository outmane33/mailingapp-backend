const express = require("express");
const { getAllSenders, addSenders } = require("../services/sendersServices");
const { testService } = require("../services/testService");
const router = express.Router();

router.post("/", testService);

module.exports = router;
