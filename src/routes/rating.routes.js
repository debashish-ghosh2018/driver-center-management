const express = require("express");
const router = express.Router();

const controller = require("../controllers/rating.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.get("/", authenticate, requirePermission("ratings.view"), controller.listRatings);


router.get("/:id", authenticate, requirePermission("ratings.view"), controller.getRating);


router.put("/:id", authenticate, requirePermission("ratings.update"), controller.updateRating);


router.delete("/:id", authenticate, requirePermission("ratings.delete"), controller.deleteRating);

module.exports = router;