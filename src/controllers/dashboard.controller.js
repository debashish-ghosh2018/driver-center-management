const { Op, fn, col, literal } = require("sequelize");
const { Customer, Driver, Vehicle, Booking, Payment } = require("../models");

exports.index = async (req, res, next) => {
  try {
    const [
      customers,
      drivers,
      availableDrivers,
      vehicles,
      pendingBookings,
      activeBookings,
      completedBookings,
      revenue
    ] = await Promise.all([
      Customer.count(),
      Driver.count(),
      Driver.count({ where: { availability: "AVAILABLE", status: "ACTIVE" } }),
      Vehicle.count(),
      Booking.count({ where: { status: "PENDING" } }),
      Booking.count({ where: { status: ["CONFIRMED","ASSIGNED","ACCEPTED","STARTED"] } }),
      Booking.count({ where: { status: "COMPLETED" } }),
      Payment.sum("amount", { where: { paymentStatus: "PAID" } })
    ]);

    res.json({
      customers, drivers, availableDrivers, vehicles,
      pendingBookings, activeBookings, completedBookings,
      revenue: Number(revenue || 0)
    });
  } catch (e) { next(e); }
};
