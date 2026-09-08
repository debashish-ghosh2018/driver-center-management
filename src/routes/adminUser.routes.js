const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const controller = require("../controllers/user.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");
const { validate } = require("../middleware/validate");

const roles = ["SUPER_ADMIN","ADMIN","MANAGER","STAFF","DRIVER","CUSTOMER"];


/**
* @swagger
* /users:
*   get:
*     description: Get list of user for ACL
*     tags:
*       - Permissions
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/", authenticate, requirePermission("users.view"), controller.list);

/**
* @swagger
* /users/{id}:
*   get:
*     description: Get user for ACL
*     tags:
*       - Permissions
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the user
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/:id", authenticate, requirePermission("users.view"), controller.get);

/**
* @swagger
* /users:
*   post:
*     description: Create user for ACL
*     tags:
*       - Permissions
*     produces:
*       - application/json
*     parameters:
*       - name: name
*         description: User's name.
*         in: formData
*         required: true
*         type: string
*       - name: email
*         description: User's email.
*         in: formData
*         required: true
*         type: string
*       - name: password
*         description: User's login password.
*         in: formData
*         required: true
*         type: string
*       - name: role
*         description: User's role.
*         in: formData
*         required: true
*         type: string
*       - name: status
*         description: User's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return userCode automatically generate by backend
*/
router.post("/", authenticate, requirePermission("users.create"), [body("name").trim().isLength({min:2}), body("email").isEmail(), body("password").isLength({min:8}), body("role").isIn(roles), body("status").optional().isIn(["ACTIVE","INACTIVE"])], validate, controller.create);

/**
* @swagger
* /users/{id}:
*   put:
*     description: Update user
*     tags:
*       - Permissions
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the user to update
*         schema:
*           type: string
*       - name: name
*         description: User's name.
*         in: formData
*         required: true
*         type: string
*       - name: email
*         description: User's email.
*         in: formData
*         required: true
*         type: string
*       - name: password
*         description: User's login password.
*         in: formData
*         required: true
*         type: string
*       - name: role
*         description: User's role.
*         in: formData
*         required: true
*         type: string
*       - name: status
*         description: User's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return user details
*/
router.put("/:id", authenticate, requirePermission("users.update"), [body("name").optional().trim().isLength({min:2}), body("email").optional().isEmail(), body("password").optional({checkFalsy:true}).isLength({min:8}), body("role").optional().isIn(roles), body("status").optional().isIn(["ACTIVE","INACTIVE"])], validate, controller.update);

/**
* @swagger
* /users/{id}:
*   delete:
*     description: Delete user
*     tags:
*       - Permissions
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the user to delete
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.delete("/:id", authenticate, requirePermission("users.delete"), controller.remove);


//router.post("/:id/reset-password", authenticate, requirePermission("users.reset_password"), controller.resetPassword);


//router.put("/:id/status", authenticate, requirePermission("users.status"), controller.updateUserStatuss);

module.exports = router;