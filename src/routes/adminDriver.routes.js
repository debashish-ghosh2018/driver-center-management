const express = require("express");
const router = express.Router();

const user = require("../controllers/user.controller");
const controller = require("../controllers/admin-driver.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.post("/with-user", authenticate, requirePermission("drivers.create"), requirePermission("users.manage"), controller.createDriverWithUser);


//router.post("/:driverId/create-user", authenticate, requirePermission("drivers.manage_login"), requirePermission("users.manage"), controller.createUserForDriver);


router.post("/:driverId/link-user", authenticate, requirePermission("drivers.manage_login"), requirePermission("users.manage"), user.linkDriver);

module.exports = router;