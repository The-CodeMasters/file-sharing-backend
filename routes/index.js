const express = require("express");
const route = express.Router();
const { LoadLinuxDrives } = require("../controller/loadLinuxDrives");

route.get("", LoadLinuxDrives);

module.exports = route;
