const { Payment, Booking } = require("../models");

exports.list = async (req, res, next) => {
  try {
    const rows = await Payment.findAll({
      include: [{ model: Booking, attributes: ["id", "bookingNo", "customerId", "fare"] }],
      order: [["id", "DESC"]]
    });
    res.json(rows);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMode, transactionId } = req.body;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const payment = await Payment.create({
      bookingId, amount, paymentMode, transactionId, paymentStatus: "PAID"
    });
    res.status(201).json(payment);
  } catch (e) { next(e); }
};
