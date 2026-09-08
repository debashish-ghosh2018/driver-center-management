const router = require("express").Router();

const { authenticate, authorize } = require("../middleware/auth");
const { canAccessBooking } = require("../middleware/resource-access");

const { createCrud } = require("../controllers/crud.controller");
const { Customer, Driver, Vehicle } = require("../models");

const auth = [authenticate, authorize("SUPER_ADMIN","ADMIN","MANAGER","STAFF")];
const admin = [authenticate, authorize("SUPER_ADMIN","ADMIN","MANAGER")];

/*
const customer = require("../controllers/customer.controller");
router.use("/customers", ...admin);

router.get("/customers", customer.list);
router.get("/customers/:id", customer.get);
router.post("/customers", customer.create);
router.put("/customers/:id", customer.update);
router.delete("/customers/:id", customer.disable);	// customer.remove


const driver = require("../controllers/driver.controller");
router.use("/drivers", ...admin);

router.get("/drivers", driver.list);
router.get("/drivers/:id", driver.get);
router.post("/drivers", driver.create);
router.put("/drivers/:id", driver.update);
router.delete("/drivers/:id", driver.disable);	// driver.remove
router.patch("/drivers/:id/availability", driver.availability);


const vehicle = require("../controllers/vehicle.controller");
router.use("/vehicles", ...admin);

router.get("/vehicles", vehicle.list);
router.get("/vehicles/:id", vehicle.get);
router.post("/vehicles", vehicle.create);
router.put("/vehicles/:id", vehicle.update);
router.delete("/vehicles/:id", vehicle.disable);		// vehicle.remove


const booking = require("../controllers/booking.controller");
router.use("/bookings", ...auth);

router.get("/bookings", booking.list);
router.get("/bookings/:id", authenticate, canAccessBooking, booking.get);
router.post("/bookings", booking.create);
router.put("/bookings/:id", booking.update);
router.post("/bookings/:id/assign-driver", booking.assignDriver);
router.post("/bookings/:id/status", booking.status);


const payment = require("../controllers/payment.controller");
router.use("/payments", ...admin);

router.get("/payments", payment.list);
router.post("/payments", payment.create);
*/

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
