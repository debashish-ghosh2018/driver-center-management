const router = require("express").Router();
const { body } = require("express-validator");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/acl");
const { validate } = require("../middleware/validate");
const user = require("../controllers/user.controller");
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
*     description: Get user
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

router.post("/users",requirePermission("users.manage"),[
	body("name").trim().isLength({min:2}),
	body("email").isEmail(),
	body("password").isLength({min:8}),
	body("role").isIn(roles),
	body("status").optional().isIn(["ACTIVE","INACTIVE"])
], validate, user.create);

router.put("/users/:id",requirePermission("users.manage"),[
	body("name").optional().trim().isLength({min:2}),
	body("email").optional().isEmail(),
	body("password").optional({checkFalsy:true}).isLength({min:8}),
	body("role").optional().isIn(roles),
	body("status").optional().isIn(["ACTIVE","INACTIVE"])
],validate,user.update);

router.delete("/users/:id",requirePermission("users.manage"),user.remove);

router.get("/acl",requirePermission("acl.manage"),user.permissions);

router.post("/acl",requirePermission("acl.manage"),[body("role").isIn(["ADMIN","MANAGER","STAFF"]),body("permissionIds").isArray()],validate,user.setRolePermissions);

module.exports=router;
