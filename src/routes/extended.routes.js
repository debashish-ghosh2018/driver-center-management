const r = require("express").Router(), c = require("../controllers/extended.controller"), {authenticate,authorize} = require("../middleware/auth");

/**
* @swagger
* /tracking/location:
*   post:
*     description: Send driver GPS location
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     parameters:
*       - name: latitude
*         description: Send latitude.
*         in: formData
*         required: true
*         type: number
*       - name: longitude
*         description: Send longitude.
*         in: formData
*         required: true
*         type: number
*       - name: accuracy
*         description: Send location accuracy.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: APIs support the mobile driver interface. Typically used by the driver application. The backend also broadcasts the new location through Socket.IO.
*/
r.post("/tracking/location",authenticate,c.location);

/**
* @swagger
* /tracking/{driverId}:
*   get:
*     description: Get latest driver location
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     parameters:
*       - name: driverId
*         in: path
*         required: true
*         description: The ID of the driver to fetch last location
*         schema:
*           type: number
*     responses:
*       200:
*         description: Socket.IO works alongside the REST APIs. This can eventually be used so a customer only receives updates for their current trip.
*/
r.get("/tracking/:driverId",authenticate,c.latest);

/**
* @swagger
* /ratings:
*   post:
*     description: Submit customer rating
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     parameters:
*       - name: bookingId
*         description: Booking ID.
*         in: formData
*         required: true
*         type: number
*       - name: rating
*         description: Customer rating.
*         in: formData
*         required: true
*         type: number
*       - name: comment
*         description: Review comments.
*         in: formData
*         required: true
*         type: string
*     responses:
*       200:
*         description: The backend recalculates the driver's average rating.
*/
r.post("/ratings",authenticate,c.rate);

/**
* @swagger
* /ratings:
*   get:
*     description: Get ratings
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Mainly for admin or manager use.
*/
r.get("/ratings",authenticate,authorize("SUPER_ADMIN","ADMIN","MANAGER"),c.ratings);

/**
* @swagger
* /reports/summary:
*   get:
*     description: Get summary report
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Mainly for admin. Default period is approximately the current month.
*/
r.get("/reports/summary",authenticate,authorize("SUPER_ADMIN","ADMIN","MANAGER"),c.report);

/**
* @swagger
* /notifications:
*   get:
*     description: The backend foundation supports
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     responses:
*       200:
*         description: This is the notification architecture/database layer. Real external delivery still needs services such as Twilio, WhatsApp Business API, SendGrid, AWS SES, etc.
*/
r.get("/notifications",authenticate,c.notifications);

/**
* @swagger
* /audit-logs:
*   get:
*     description: The audit log foundation records actions
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     responses:
*       200:
*         description: This is especially useful for the admin system.
*/
r.get("/audit-logs",authenticate,authorize("SUPER_ADMIN","ADMIN"),c.audits);

/**
* @swagger
* /invoices/{bookingId}/pdf:
*   get:
*     description: Generate invoice PDF
*     tags:
*       - Tracking & Notification
*     produces:
*       - application/json
*     parameters:
*       - name: bookingId
*         description: Booking ID.
*         in: formData
*         required: true
*         type: number
*     responses:
*       200:
*         description: The API generates a PDF for customer. Use in React frontend.
*/
r.get("/invoices/:bookingId/pdf",authenticate,c.invoice);

module.exports = r;
