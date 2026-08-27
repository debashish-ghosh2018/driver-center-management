const bcrypt = require("bcryptjs");
const {User,Permission,RolePermission} = require("../models");

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