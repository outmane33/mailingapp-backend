const express = require("express");
const { getDataByISP, getAllData } = require("../services/data_service");
const router = express.Router();

router.route("/").post(getDataByISP).get(getAllData);

module.exports = router;
