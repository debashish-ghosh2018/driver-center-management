const router = require("express").Router();
const { body } = require("express-validator");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/acl");
const { validate } = require("../middleware/validate");
const user = require("../controllers/user.controller");
const adminCustomer = require("../controllers/admin-customer.controller");
const adminDriver = require("../controllers/admin-driver.controller");
const roles = ["SUPER_ADMIN","ADMIN","MANAGER","STAFF","DRIVER","CUSTOMER"];

router.use(authenticate);

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
router.get("/users",requirePermission("users.manage"),user.list);

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
router.get("/users/:id",requirePermission("users.manage"),user.get);

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
router.post("/users",requirePermission("users.manage"),[
	body("name").trim().isLength({min:2}),
	body("email").isEmail(),
	body("password").isLength({min:8}),
	body("role").isIn(roles),
	body("status").optional().isIn(["ACTIVE","INACTIVE"])
], validate, user.create);

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
router.put("/users/:id",requirePermission("users.manage"),[
	body("name").optional().trim().isLength({min:2}),
	body("email").optional().isEmail(),
	body("password").optional({checkFalsy:true}).isLength({min:8}),
	body("role").optional().isIn(roles),
	body("status").optional().isIn(["ACTIVE","INACTIVE"])
],validate,user.update);

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
router.delete("/users/:id",requirePermission("users.manage"),user.remove);

router.post("/customers/with-user", authenticate, requirePermission("customers.create"), requirePermission("users.manage"), adminCustomer.createCustomerWithUser);

router.post("/drivers/with-user", authenticate, requirePermission("drivers.create"), requirePermission("users.manage"), adminDriver.createDriverWithUser);

router.post("/users/:userId/link-customer",authenticate,requirePermission("users.manage"),user.linkCustomer);

router.post("/users/:userId/link-driver",authenticate,requirePermission("users.manage"),user.linkDriver);

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
router.get("/acl",requirePermission("acl.manage"),user.permissions);

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
router.post("/acl",requirePermission("acl.manage"),[
	body("role").isIn(["ADMIN","MANAGER","STAFF"]),
	body("permissionIds").isArray()
],validate,user.setRolePermissions);

module.exports=router;
