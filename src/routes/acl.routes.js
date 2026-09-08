const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const controller = require("../controllers/user.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");
const { validate } = require("../middleware/validate");


/**
* @swagger
* /acl:
*   get:
*     description: Get list of ACL for user 
*     tags:
*       - Permissions
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/", authenticate, requirePermission("acl.view"), controller.permissions);

/**
* @swagger
* /acl:
*   post:
*     description: Add access control data for user
*     tags:
*       - Permissions
*     produces:
*       - application/json
*     parameters:
*       - name: role
*         description: Role's name.
*         in: formData
*         required: true
*         type: string
*       - name: permissionIds
*         description: Role's permissionIds.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return userCode automatically generate by backend
*/
router.post("/", authenticate, requirePermission("acl.manage"), [body("role").isIn(["ADMIN","MANAGER","STAFF"]), body("permissionIds").isArray()], validate, controller.setRolePermissions);

module.exports = router;