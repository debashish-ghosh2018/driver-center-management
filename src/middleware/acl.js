const { Permission, RolePermission } = require("../models");

function requirePermission(code) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Authentication required" });
      if (req.user.role === "SUPER_ADMIN") return next();
      const permission = await Permission.findOne({ where: { code } });
      if (!permission) return res.status(403).json({ message: "Permission not configured" });
      const match = await RolePermission.findOne({ where: { role: req.user.role, permissionId: permission.id } });
      if (!match) return res.status(403).json({ message: "Permission denied" });
      next();
    } catch (e) { next(e); }
  };
}

module.exports = { requirePermission };
