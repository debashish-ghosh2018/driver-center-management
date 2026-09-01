const bcrypt = require("bcryptjs");

const {sequelize, User, Driver} = require("../models");

exports.createDriverWithUser = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {name, mobile, email, password, address, licenseNo, licenseExpiry, experienceYears, createUser = true} = req.body;
      let user = null;

      if (createUser) {
        const existing = await User.unscoped().findOne({where: { email }, transaction});

        if (existing) {
          await transaction.rollback();

          return res.status(409).json({message: "User already exists with this email"});
        }

        const passwordHash = await bcrypt.hash(password, 12);
        user = await User.unscoped().create({name, email, passwordHash, role: "DRIVER", status: "ACTIVE"}, {transaction});
      }

      const driver = await Driver.create({
            userId: user?.id || null,
            driverCode: `DRV-${Date.now()}`,
            name,
            mobile,
            email,
            address,
            licenseNo,
            licenseExpiry,
            experienceYears,
            availability: "OFFLINE",
            status: "ACTIVE"
          },
          {transaction}
        );

      await transaction.commit();
      res.status(201).json({
        message: "Driver created successfully",
        driver,
        user: user ? {id: user.id, name: user.name, email: user.email, role: user.role} : null
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
};