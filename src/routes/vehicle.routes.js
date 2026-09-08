const express = require("express");
const router = express.Router();

const controller = require("../controllers/vehicle.controller");

const {authenticate} = require("../middleware/auth");
const {requirePermission} = require("../middleware/acl");


/**
* @swagger
* /vehicles:
*   get:
*     description: Get all vehicles
*     tags:
*       - Transports
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/", authenticate, requirePermission("vehicles.view"), controller.list);

/**
* @swagger
* /vehicles/{id}:
*   get:
*     description: Get vehicle
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the vehicle
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/:id",authenticate, requirePermission("vehicles.view"), controller.get);

/**
* @swagger
* /vehicles:
*   post:
*     description: Add vehicle
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: vehicleNo
*         description: Vehicle's number.
*         in: formData
*         required: true
*         type: string
*       - name: vehicleType
*         description: Vehicle's type.
*         in: formData
*         required: true
*         type: string
*       - name: brand
*         description: Vehicle's brand.
*         in: formData
*         required: true
*         type: string
*       - name: model
*         description: Vehicle's model.
*         in: formData
*         required: true
*         type: string
*       - name: year
*         description: Vehicle's year.
*         in: formData
*         required: true
*         type: number
*       - name: insuranceExpiry
*         description: Vehicle's insurance Expiry Date.
*         in: formData
*         required: true
*         type: string
*       - name: fitnessExpiry
*         description: Vehicle's fitness Expiry Date.
*         in: formData
*         required: true
*         type: string
*       - name: status
*         description: Vehicle's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return vehicleCode automatically generate by backend
*/
router.post("/", authenticate, requirePermission("vehicles.create"), controller.create);

/**
* @swagger
* /vehicles/{id}:
*   put:
*     description: Update vehicle
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the vehicle to update
*         schema:
*           type: string
*       - name: insuranceExpiry
*         description: Vehicle's insurance Expiry Date.
*         in: formData
*         required: true
*         type: string
*       - name: fitnessExpiry
*         description: Vehicle's fitness Expiry Date.
*         in: formData
*         required: true
*         type: string
*       - name: status
*         description: Vehicle's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return vehicle details
*/
router.put("/:id", authenticate, requirePermission("vehicles.update"), controller.update);

/**
* @swagger
* /vehicles/{id}:
*   delete:
*     description: Delete vehicle
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the vehicle to delete
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.delete("/:id", authenticate, requirePermission("vehicles.delete"), controller.disable);

module.exports = router;