const {Booking} = require("../models");

async function canAccessBooking(req, res, next) {
  try {
    const booking = await Booking.findByPk(req.params.id || req.params.bookingId);

    if (!booking) {
      return res.status(404).json({message: "Booking not found"});
    }

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"];
    if (adminRoles.includes(req.user.role)) {
      req.booking = booking;
      return next();
    }

    if (req.user.role === "CUSTOMER" && booking.customerId === req.user.customerId) {
      req.booking = booking;
      return next();
    }

    if (req.user.role === "DRIVER" && booking.driverId === req.user.driverId) {
      req.booking = booking;
      return next();
    }

    return res.status(403).json({message: "Access denied"});
  } catch (error) {
    next(error);
  }
}

module.exports = {canAccessBooking};