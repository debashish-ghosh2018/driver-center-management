const express = require("express");
const router = express.Router();

const user = require("../controllers/user.controller");
const controller = require("../controllers/admin-customer.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


router.post("/with-user", authenticate, requirePermission("customers.create"), requirePermission("users.manage"), controller.createCustomerWithUser);


//router.post("/:customerId/create-user", authenticate, requirePermission("customers.manage_login"), requirePermission("users.manage"), controller.createUserForCustomer);


router.post("/:customerId/link-user", authenticate, requirePermission("customers.manage_login"), requirePermission("users.manage"), user.linkCustomer);

module.exports = router;