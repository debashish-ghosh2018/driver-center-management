const express = require("express");
const router = express.Router();

const controller = require("../controllers/notification.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.get("/", authenticate, requirePermission("notifications.view"), controller.listNotifications);


router.get("/:id", authenticate, requirePermission("notifications.view"), controller.getNotification);


router.post("/send", authenticate, requirePermission("notifications.send"), controller.sendNotification);


router.delete("/:id", authenticate, requirePermission("notifications.delete"), controller.deleteNotification);

module.exports = router;