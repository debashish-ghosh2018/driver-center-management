const express = require("express");
const router = express.Router();

const controller = require("../controllers/payment.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


/**
* @swagger
* /payments:
*   get:
*     description: Get payment history
*     tags:
*       - Transports
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/", authenticate, requirePermission("payments.view"), controller.list);


//router.get("/:id", authenticate, requirePermission("payments.view"), controller.get);

/**
* @swagger
* /payments:
*   post:
*     description: Add payment
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: bookingId
*         description: Payment's booking Id.
*         in: formData
*         required: true
*         type: number
*       - name: amount
*         description: Payment's amount.
*         in: formData
*         required: true
*         type: number
*       - name: paymentMode
*         description: Payment's mode.
*         in: formData
*         required: true
*         type: string
*       - name: transactionId
*         description: Payment's transaction Id.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return bookingCode automatically generate by backend
*/
router.post("/", authenticate, requirePermission("payments.create"), controller.create);


//router.put("/:id", authenticate, requirePermission("payments.update"), controller.update);


//router.delete("/:id", authenticate, requirePermission("payments.delete"), controller.remove);


//router.post("/:id/refund", authenticate, requirePermission("payments.refund"), controller.refund);

module.exports = router;