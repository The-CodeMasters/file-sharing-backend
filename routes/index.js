const express = require("express");
const route = express.Router();
const { LoadLinuxDrives } = require("../controller/LinuxFileSys");

route.get("", LoadLinuxDrives);

module.exports = route;
