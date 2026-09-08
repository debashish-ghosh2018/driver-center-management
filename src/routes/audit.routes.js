const express = require("express");
const router = express.Router();

const controller = require("../controllers/audit.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.get("/", authenticate, requirePermission("audit.view"), controller.listAuditLogs);


router.get("/export", authenticate, requirePermission("audit.export"), controller.exportAuditLogs);

module.exports = router;