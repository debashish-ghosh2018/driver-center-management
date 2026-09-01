const bcrypt = require("bcryptjs");
const {User,Customer,Driver,Permission,RolePermission} = require("../models");

/*
exports.list = async (req, res, next) => {
    try {
        res.json(await User.unscoped().findAll({
            attributes: {
                exclude: ["passwordHash"]
            },
            order: [
                ["id", "DESC"]
            ]
        }));
    } catch (e) {
        next(e)
    }
};
*/

exports.list = async (req, res, next) => {
    try {
        const users = await User.unscoped().findAll({
            attributes: {exclude: ["passwordHash"]},
            include: [
                {model: Customer, as: "customerProfile", attributes: ["id", "customerCode", "mobile", "status"]},
                {model: Driver, as: "driverProfile", attributes: ["id", "driverCode", "mobile", "availability", "status"]}
            ],
            order: [
                ["id", "DESC"]
            ]
        });

        res.json(users);
    } catch (error) {
      next(error);
    }
};

exports.get = async (req, res, next) => {
    try {
        const r = await User.unscoped().findByPk(req.params.id, {
            attributes: {
                exclude: ["passwordHash"]
            }
        });
        if (!r) return res.status(404).json({
            message: "User not found"
        });
        res.json(r);
    } catch (e) {
        next(e)
    }
};

exports.create = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role,
            status
        } = req.body;
        const passwordHash = await bcrypt.hash(password, 12);
        const r = await User.unscoped().create({
            name,
            email,
            passwordHash,
            role,
            status: status || "ACTIVE"
        });
        const j = r.toJSON();
        delete j.passwordHash;
        res.status(201).json(j);
    } catch (e) {
        next(e)
    }
};

exports.update = async (req, res, next) => {
    try {
        const r = await User.unscoped().findByPk(req.params.id);
        if (!r) return res.status(404).json({
            message: "User not found"
        });
        const u = {
            ...req.body
        };
        if (u.password) {
            u.passwordHash = await bcrypt.hash(u.password, 12);
            delete u.password;
        }
        await r.update(u);
        const j = r.toJSON();
        delete j.passwordHash;
        res.json(j);
    } catch (e) {
        next(e)
    }
};

exports.remove = async (req, res, next) => {
    try {
        if (Number(req.params.id) === Number(req.user.id)) return res.status(400).json({
            message: "You cannot delete your own account"
        });
        const r = await User.unscoped().findByPk(req.params.id);
        if (!r) return res.status(404).json({
            message: "User not found"
        });
        await r.destroy();
        res.json({
            message: "User deleted"
        });
    } catch (e) {
        next(e)
    }
};

exports.linkCustomer = async (req, res, next) => {
    try {
      const user = await User.unscoped().findByPk(req.params.userId);
      const customer = await Customer.findByPk(req.body.customerId);

      if (!user || !customer) {
        return res.status(404).json({message: "User or customer not found"});
      }

      if (user.role !== "CUSTOMER") {
        return res.status(400).json({message: "User role must be CUSTOMER"});
      }

      if (customer.userId) {
        return res.status(409).json({ message: "Customer is already linked to another user"});
      }

      await customer.update({userId: user.id});

      res.json({message: "Customer linked successfully"});
    } catch (error) {
      next(error);
    }
};

exports.linkDriver = async (req, res, next) => {
    try {
      const user = await User.unscoped().findByPk(req.params.userId);
      const driver = await Driver.findByPk(req.body.driverId);

      if (!user || !driver) {
        return res.status(404).json({message: "User or driver not found"});
      }

      if (user.role !== "DRIVER") {
        return res.status(400).json({message: "User role must be DRIVER"});
      }

      if (driver.userId) {
        return res.status(409).json({message: "Driver already linked to another user"});
      }

      await driver.update({userId: user.id});

      res.json({message: "Driver linked successfully"});
    } catch (error) {
      next(error);
    }
};

exports.permissions = async (req, res, next) => {
    try {
        res.json({
            permissions: await Permission.findAll({
                order: [
                    ["module", "ASC"],
                    ["code", "ASC"]
                ]
            }),
            mappings: await RolePermission.findAll()
        });
    } catch (e) {
        next(e)
    }
};

exports.setRolePermissions = async (req, res, next) => {
    try {
        const {
            role,
            permissionIds
        } = req.body;
        await RolePermission.destroy({
            where: {
                role
            }
        });
        if (permissionIds.length) await RolePermission.bulkCreate(permissionIds.map(permissionId => ({
            role,
            permissionId
        })));
        res.json({
            message: "Permissions updated"
        });
    } catch (e) {
        next(e)
    }
};