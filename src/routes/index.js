const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const { canAccessBooking } = require("../middleware/resource-access");
const { createCrud } = require("../controllers/crud.controller");
const { Customer, Driver, Vehicle } = require("../models");

const auth = [authenticate, authorize("SUPER_ADMIN","ADMIN","MANAGER","STAFF")];
const admin = [authenticate, authorize("SUPER_ADMIN","ADMIN","MANAGER")];

const customer = require("../controllers/customer.controller");
router.use("/customers", ...admin);

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
router.get("/customers", customer.list);

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
router.get("/customers/:id", customer.get);

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
router.post("/customers", customer.create);

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
router.put("/customers/:id", customer.update);

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
router.delete("/customers/:id", customer.disable);	// customer.remove

const driver = require("../controllers/driver.controller");
router.use("/drivers", ...admin);

/**
* @swagger
* /drivers:
*   get:
*     description: Get all drivers
*     tags:
*       - Users
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/drivers", driver.list);

/**
* @swagger
* /drivers/{id}:
*   get:
*     description: Get driver
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the driver
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/drivers/:id", driver.get);

/**
* @swagger
* /drivers:
*   post:
*     description: Create driver
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: name
*         description: Driver's name.
*         in: formData
*         required: true
*         type: string
*       - name: mobile
*         description: Driver's mobile.
*         in: formData
*         required: true
*         type: string
*       - name: email
*         description: Driver's email.
*         in: formData
*         required: true
*         type: string
*       - name: address
*         description: Driver's address.
*         in: formData
*         required: true
*         type: string
*       - name: licenseNo
*         description: Driver's license No.
*         in: formData
*         required: true
*         type: string
*       - name: licenseExpiry
*         description: Driver's license Expiry Date.
*         in: formData
*         required: true
*         type: string
*       - name: experienceYears
*         description: Driver's experience in Years.
*         in: formData
*         required: true
*         type: number
*     responses:
*       200:
*         description: Return driverCode automatically generate by backend
*/
router.post("/drivers", driver.create);

/**
* @swagger
* /drivers/{id}:
*   put:
*     description: Update driver
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the driver to update
*         schema:
*           type: string
*       - name: licenseExpiry
*         description: Driver's license Expiry Date.
*         in: formData
*         required: true
*         type: string
*       - name: experienceYears
*         description: Driver's experience in Years.
*         in: formData
*         required: true
*         type: number
*       - name: status
*         description: Customer's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return driver details
*/
router.put("/drivers/:id", driver.update);

/**
* @swagger
* /drivers/{id}:
*   delete:
*     description: Delete driver
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the driver to delete
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.delete("/drivers/:id", driver.disable);	// driver.remove

/**
* @swagger
* /drivers/{id}/availability:
*   patch:
*     description: Update driver availability
*     tags:
*       - Users
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the driver to update availability
*         schema:
*           type: string
*       - name: availability
*         description: Driver's availability status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.patch("/drivers/:id/availability", driver.availability);

const vehicle = require("../controllers/vehicle.controller");
router.use("/vehicles", ...admin);

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
router.get("/vehicles", vehicle.list);

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
router.get("/vehicles/:id", vehicle.get);

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
router.post("/vehicles", vehicle.create);

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
router.put("/vehicles/:id", vehicle.update);

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
router.delete("/vehicles/:id", vehicle.disable);		// vehicle.remove

const booking = require("../controllers/booking.controller");
router.use("/bookings", ...auth);

/**
* @swagger
* /bookings:
*   get:
*     description: Get all bookings
*     tags:
*       - Transports
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/bookings", booking.list);

/**
* @swagger
* /bookings/{id}:
*   get:
*     description: Get one booking
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the one booking
*         schema:
*           type: string
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/bookings/:id", authenticate, canAccessBooking, booking.get);

/**
* @swagger
* /bookings:
*   post:
*     description: Create booking
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: customerId
*         description: Booking's customer Id.
*         in: formData
*         required: true
*         type: number
*       - name: pickupLocation
*         description: Booking's pickup location.
*         in: formData
*         required: true
*         type: string
*       - name: dropLocation
*         description: Booking's drop location.
*         in: formData
*         required: true
*         type: string
*       - name: pickupDate
*         description: Booking's pickup date.
*         in: formData
*         required: true
*         type: string
*       - name: pickupTime
*         description: Booking's pickup time.
*         in: formData
*         required: true
*         type: string
*       - name: bookingType
*         description: Booking's type.
*         in: formData
*         required: true
*         type: string
*       - name: vehicleType
*         description: Booking's vehicle type.
*         in: formData
*         required: true
*         type: string
*       - name: fare
*         description: Booking's fare.
*         in: formData
*         required: true
*         type: number
*       - name: remarks
*         description: Booking's customer remarks.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return bookingCode automatically generate by backend
*/
router.post("/bookings", booking.create);

/**
* @swagger
* /bookings/{id}:
*   put:
*     description: Update booking
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the booking to update
*         schema:
*           type: string
*       - name: pickupLocation
*         description: Booking's pickup location.
*         in: formData
*         required: true
*         type: string
*       - name: dropLocation
*         description: Booking's drop location.
*         in: formData
*         required: true
*         type: string
*       - name: pickupDate
*         description: Booking's pickup date.
*         in: formData
*         required: true
*         type: string
*       - name: pickupTime
*         description: Booking's pickup time.
*         in: formData
*         required: true
*         type: string
*       - name: bookingType
*         description: Booking's type.
*         in: formData
*         required: true
*         type: string
*       - name: vehicleType
*         description: Booking's vehicle type.
*         in: formData
*         required: true
*         type: string
*       - name: fare
*         description: Booking's fare.
*         in: formData
*         required: true
*         type: number
*       - name: remarks
*         description: Booking's customer remarks.
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
*         description: Return booking details
*/
router.put("/bookings/:id", booking.update);

/**
* @swagger
* /bookings/{id}/assign-driver:
*   post:
*     description: Assign driver
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the booking to update
*         schema:
*           type: string
*       - name: driverId
*         description: Booking's driver Id.
*         in: formData
*         required: true
*         type: number
*       - name: vehicleId
*         description: Booking's vehicle Id.
*         in: formData
*         required: true
*         type: number
*       - name: status
*         description: Booking's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return booking details
*/
router.post("/bookings/:id/assign-driver", booking.assignDriver);

/**
* @swagger
* /bookings/{id}/status:
*   post:
*     description: Update booking/trip status
*     tags:
*       - Transports
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*         description: The ID of the booking to update
*         schema:
*           type: string
*       - name: status
*         description: Booking's status.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: Return booking details
*/
router.post("/bookings/:id/status", booking.status);

const payment = require("../controllers/payment.controller");
router.use("/payments", ...admin);

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
router.get("/payments", payment.list);

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
router.post("/payments", payment.create);

const dashboard = require("../controllers/dashboard.controller");

/**
* @swagger
* /dashboard:
*   get:
*     description: Get dashboard statistics
*     tags:
*       - Users
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Used by the admin dashboard.
*/
router.get("/dashboard", ...auth, dashboard.index);

module.exports = router;
