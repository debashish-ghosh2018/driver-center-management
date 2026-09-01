const { Booking, Customer, Driver, Vehicle, DriverEarning, Notification, AuditLog } = require("../models");

/*
exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const rows = await Booking.findAll({
      include: [
        { model: Customer, attributes: ["id", "name", "mobile"] },
        { model: Driver, attributes: ["id", "name", "mobile", "rating"] },
        { model: Vehicle, attributes: ["id", "vehicleNo", "vehicleType"] }
      ],
      where,
      order: [["id", "DESC"]]
    });
    res.json(rows);
  } catch (e) { next(e); }
};
*/

exports.list = async (req, res, next) => {
    try {
      const where = {};

      if (req.user.role === "CUSTOMER") {
        if (!req.user.customerId) {
          return res.status(403).json({ message: "Customer profile is not linked" });
        }
        where.customerId = req.user.customerId;
      }

      if (req.user.role === "DRIVER") {
        if (!req.user.driverId) {
          return res.status(403).json({message: "Driver profile is not linked"});
        }
        where.driverId = req.user.driverId;
      }

      const rows = await Booking.findAll({
        where, 
        include: [
          {model: Customer, attributes: ["id", "name", "mobile"]}, 
          {model: Driver, attributes: ["id", "name", "mobile", "rating"]}, 
          {model: Vehicle, attributes: ["id", "vehicleNo", "vehicleType"]}
        ], 
        order: [["id", "DESC"]]
      });
      res.json(rows);
    } catch (error) {
      next(error);
    }
};

exports.get = async (req, res, next) => {
  try {
    const row = await Booking.findByPk(req.params.id, {
      include: [Customer, Driver, Vehicle]
    });
    if (!row) return res.status(404).json({ message: "Booking not found" });
    res.json(row);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.customerId || !body.pickupLocation || !body.dropLocation ||
        !body.pickupDate || !body.pickupTime) {
      return res.status(400).json({ message: "Customer, pickup, drop, date and time are required" });
    }
    body.bookingNo ||= `BK-${Date.now()}`;
    const booking = await Booking.create(body);
    res.status(201).json(booking);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    await booking.update(req.body);
    if (booking.status === "COMPLETED" && booking.driverId && !(await DriverEarning.findOne({where:{bookingId:booking.id}}))) { const gross=Number(booking.fare||0), commission=+(gross*.20).toFixed(2); await DriverEarning.create({driverId:booking.driverId,bookingId:booking.id,grossFare:gross,commissionRate:20,commissionAmount:commission,netEarning:+(gross-commission).toFixed(2)}); }
    await Notification.create({customerId:booking.customerId,driverId:booking.driverId,channel:"IN_APP",title:"Booking updated",message:`${booking.bookingNo} is ${booking.status}`,status:"SENT",sentAt:new Date()});
    res.json(booking);
  } catch (e) { next(e); }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId, vehicleId } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const driver = await Driver.findByPk(driverId);
    if (!driver || driver.status !== "ACTIVE") return res.status(400).json({ message: "Driver unavailable" });

    if (vehicleId) {
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle || vehicle.status !== "ACTIVE") return res.status(400).json({ message: "Vehicle unavailable" });
      booking.vehicleId = vehicleId;
    }

    booking.driverId = driverId;
    booking.status = "ASSIGNED";
    await booking.save();

    driver.availability = "BUSY";
    await driver.save();

    await Notification.create({customerId:booking.customerId,driverId:driverId,channel:"IN_APP",title:"Driver assigned",message:`Driver assigned to ${booking.bookingNo}`,status:"SENT",sentAt:new Date()});
    res.json(booking);
  } catch (e) { next(e); }
};

exports.status = async (req, res, next) => {
  try {
    const allowed = ["PENDING","CONFIRMED","ASSIGNED","ACCEPTED","STARTED","COMPLETED","CANCELLED"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid booking status" });

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    await booking.save();

    if (booking.driverId && ["COMPLETED", "CANCELLED"].includes(booking.status)) {
      const driver = await Driver.findByPk(booking.driverId);
      if (driver) {
        driver.availability = "AVAILABLE";
        await driver.save();
      }
    }

    res.json(booking);
  } catch (e) { next(e); }
};
