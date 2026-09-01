const bcrypt = require("bcryptjs");

const {sequelize, User, Customer} = require("../models");

exports.createCustomerWithUser = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const {name, mobile, email, password, address, city, state, pincode, createUser = true} = req.body;
      let user = null;

      if (createUser) {
        const existing = await User.unscoped().findOne({where: { email }, transaction});

        if (existing) {
          await transaction.rollback();
          return res.status(409).json({message: "User already exists with this email"});
        }

        const passwordHash = await bcrypt.hash(password, 12);
        user = await User.unscoped().create({name, email, passwordHash, role: "CUSTOMER", status: "ACTIVE"}, {transaction});
      }

      const customer = await Customer.create({
            userId: user?.id || null,
            customerCode: `CUS-${Date.now()}`,
            name,
            mobile,
            email,
            address,
            city,
            state,
            pincode,
            status: "ACTIVE"
          },
          { transaction }
        );

      await transaction.commit();
      res.status(201).json({
        message: "Customer created successfully",
        customer,
        user: user ? {id: user.id, name: user.name, email: user.email, role: user.role} : null
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
};