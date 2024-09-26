const express = require("express");
const { getDataByISP } = require("../services/data_service");
const router = express.Router();

router.route("/").post(getDataByISP);

module.exports = router;
