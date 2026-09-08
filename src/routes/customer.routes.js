const express = require("express");
const router = express.Router();

const controller = require("../controllers/customer.controller");

const { authenticate, authorize } = require("../middleware/auth");
const { requirePermission } = require("../middleware/acl");


/**
* @swagger
* /customers:
*   get:
*     description: Get all customers
*     tags:
*       - Users
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/", authenticate, requirePermission("customers.view"), controller.list);

/**
* @swagger
* /customers/{id}:
*   get:
*     description: Get customer
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the customer
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/:id", authenticate, requirePermission("customers.view"), controller.get);

/**
* @swagger
* /customers:
*   post:
*     description: Create customer
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: name
*         description: Customer's name.
*         in: formData
*         required: true
*         type: string
*       - name: mobile
*         description: Customer's mobile.
*         in: formData
*         required: true
*         type: string
*       - name: email
*         description: Customer's email.
*         in: formData
*         required: true
*         type: string
*       - name: address
*         description: Customer's address.
*         in: formData
*         required: true
*         type: string
*       - name: city
*         description: Customer's city.
*         in: formData
*         required: true
*         type: string
*       - name: state
*         description: Customer's state.
*         in: formData
*         required: true
*         type: string
*       - name: pincode
*         description: Customer's pincode.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return customerCode automatically generate by backend
*/
router.post("/", authenticate, requirePermission("customers.create"), controller.create);

/**
* @swagger
* /customers/{id}:
*   put:
*     description: Update customer
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the customer to update
*         schema:
*           type: string
*       - name: mobile
*         description: Customer's mobile.
*         in: formData
*         required: true
*         type: string
*       - name: city
*         description: Customer's city.
*         in: formData
*         required: true
*         type: string
*       - name: status
*         description: Customer's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return customer details
*/
router.put("/:id", authenticate, requirePermission("customers.update"), controller.update);

/**
* @swagger
* /customers/{id}:
*   delete:
*     description: Delete customer
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the customer to delete
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.delete("/:id", authenticate, requirePermission("customers.delete"), controller.disable);

module.exports = router;