const express = require("express");
const router = express.Router();

const controller = require("../controllers/driverEarning.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.get("/", authenticate, requirePermission("earnings.view"), controller.listEarnings);


router.get("/:id", authenticate, requirePermission("earnings.view"), controller.getEarning);


router.post("/", authenticate, requirePermission("earnings.create"), controller.createEarning);


router.put("/:id", authenticate, requirePermission("earnings.update"), controller.updateEarning);


router.post("/:id/approve", authenticate, requirePermission("earnings.approve"), controller.approveEarning);


router.post("/:id/pay", authenticate, requirePermission("earnings.pay"), controller.markPaid);

module.exports = router;