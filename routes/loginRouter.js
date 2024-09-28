const express = require("express");
const { login, register, getAllUsers } = require("../services/loginService");
const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/users").get(getAllUsers);

module.exports = router;
