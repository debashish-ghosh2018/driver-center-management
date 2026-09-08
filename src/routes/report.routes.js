const express = require("express");
const router = express.Router();

const controller = require("../controllers/report.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.get("/", authenticate, requirePermission("reports.view"), controller.dashboardReport);


router.get("/bookings", authenticate, requirePermission("reports.bookings"), controller.bookingReport);


router.get("/revenue", authenticate, requirePermission("reports.revenue"), controller.revenueReport);


router.get("/drivers", authenticate, requirePermission("reports.drivers"), controller.driverReport);


router.get("/customers", authenticate, requirePermission("reports.customers"), controller.customerReport);


router.get("/payments", authenticate, requirePermission("reports.payments"), controller.paymentReport);


router.get("/earnings", authenticate, requirePermission("reports.earnings"), controller.earningReport);


router.get("/export", authenticate, requirePermission("reports.export"), controller.exportReport);

module.exports = router;