const PDFDocument = require("pdfkit");
const {
    Op
} = require("sequelize");
const {
    DriverLocation,
    Rating,
    Booking,
    Driver,
    Customer,
    Payment,
    DriverEarning,
    Notification,
    AuditLog
} = require("../models");

exports.location = async (req, res, next) => {
    try {
        const {
            driverId,
            latitude,
            longitude,
            accuracy,
            bookingId
        } = req.body;
        if (!driverId || latitude == null || longitude == null) return res.status(400).json({
            message: "driverId, latitude and longitude required"
        });
        const row = await DriverLocation.create({
            driverId,
            latitude,
            longitude,
            accuracy
        });
        const io = req.app.get("io");

        if (io) {
            io.emit("driver:location", row);
            if (bookingId)
                io.to(`booking:${bookingId}`).emit("driver:location", row)
        }
        res.status(201).json(row)
    } catch (e) {
        next(e)
    }
};

exports.latest = async (req, res, next) => {
    try {
        const row = await DriverLocation.findOne({
            where: {
                driverId: req.params.driverId
            },
            order: [
                ["recordedAt", "DESC"]
            ]
        });
        if (!row)
            return res.status(404).json({
                message: "Location not found"
            });
        res.json(row)
    } catch (e) {
        next(e)
    }
};

exports.rate = async (req, res, next) => {
    try {
        const {
            bookingId,
            rating,
            comment
        } = req.body, b = await Booking.findByPk(bookingId);

        if (!b || b.status !== "COMPLETED")
            return res.status(400).json({
                message: "Completed booking required"
            });

        if (await Rating.findOne({
                where: {
                    bookingId
                }
            })) return res.status(409).json({
            message: "Already rated"
        });

        const row = await Rating.create({
            bookingId,
            customerId: b.customerId,
            driverId: b.driverId,
            rating,
            comment
        });
        const all = await Rating.findAll({
                where: {
                    driverId: b.driverId
                }
            }),
            avg = all.reduce((a, x) => a + x.rating, 0) / all.length;
        await Driver.update({
            rating: +avg.toFixed(2)
        }, {
            where: {
                id: b.driverId
            }
        });
        res.status(201).json(row)
    } catch (e) {
        next(e)
    }
};

exports.ratings = async (req, res, next) => {
    try {
        res.json(await Rating.findAll({
            order: [
                ["id", "DESC"]
            ]
        }))
    } catch (e) {
        next(e)
    }
};

exports.report = async (req, res, next) => {
    try {
        const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            to = req.query.to ? new Date(req.query.to + "T23:59:59") : new Date();
        const [bookings, revenue, earnings] = await Promise.all([Booking.count({
            where: {
                createdAt: {
                    [Op.between]: [from, to]
                }
            }
        }), Payment.sum("amount", {
            where: {
                paymentStatus: "PAID",
                createdAt: {
                    [Op.between]: [from, to]
                }
            }
        }), DriverEarning.sum("netEarning", {
            where: {
                createdAt: {
                    [Op.between]: [from, to]
                }
            }
        })]);
        res.json({
            from,
            to,
            bookings,
            revenue: Number(revenue || 0),
            driverNetEarnings: Number(earnings || 0)
        })
    } catch (e) {
        next(e)
    }
};

exports.notifications = async (req, res, next) => {
    try {
        res.json(await Notification.findAll({
            order: [
                ["id", "DESC"]
            ],
            limit: 100
        }))
    } catch (e) {
        next(e)
    }
};

exports.audits = async (req, res, next) => {
    try {
        res.json(await AuditLog.findAll({
            order: [
                ["id", "DESC"]
            ],
            limit: 200
        }))
    } catch (e) {
        next(e)
    }
};

exports.invoice = async (req, res, next) => {
    try {
        const b = await Booking.findByPk(req.params.bookingId, {
            include: [Customer, Driver]
        });
        if (!b) return res.status(404).json({
            message: "Booking not found"
        });
        const pays = await Payment.findAll({
            where: {
                bookingId: b.id
            }
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=invoice-${b.bookingNo}.pdf`);
        const d = new PDFDocument({
            margin: 50
        });
        d.pipe(res);
        d.fontSize(22).text("DRIVER CENTER", {
            align: "center"
        }).moveDown();
        d.fontSize(14).text(`Invoice: ${b.bookingNo}`).text(`Customer: ${b.Customer?.name||""}`).text(`Driver: ${b.Driver?.name||"Not assigned"}`).text(`Pickup: ${b.pickupLocation}`).text(`Drop: ${b.dropLocation}`).text(`Trip: ${b.pickupDate} ${b.pickupTime}`).moveDown().fontSize(16).text(`Fare: INR ${Number(b.fare||0).toFixed(2)}`).text(`Paid: INR ${pays.reduce((s,p)=>s+Number(p.amount||0),0).toFixed(2)}`);
        d.end()
    } catch (e) {
        next(e)
    }
};