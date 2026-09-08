const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminSettings.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.get("/", authenticate, requirePermission("settings.manage"), controller.getSettings);

router.put("/", authenticate, requirePermission("settings.manage"), controller.updateSettings);


/*
router.put("/general", authenticate, requirePermission("settings.general"), controller.updateGeneralSettings);

router.put("/notifications", authenticate, requirePermission("settings.notifications"), controller.updateNotificationSettings);

router.put("/email", authenticate, requirePermission("settings.email"), controller.updateEmailSettings);

router.put("/sms", authenticate, requirePermission("settings.sms"), controller.updateSmsSettings);

router.put("/whatsapp", authenticate, requirePermission("settings.whatsapp"), controller.updateWhatsAppSettings);

router.put("/commission", authenticate, requirePermission("settings.commission"), controller.updateCommissionSettings);
*/

module.exports = router;