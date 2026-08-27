const { DataTypes, Model } = require("sequelize");

class RolePermission extends Model {
  static initModel(sequelize) {
    RolePermission.init({
      role: { type: DataTypes.STRING(50), allowNull: false },
      permissionId: { type: DataTypes.INTEGER, allowNull: false }
    }, { sequelize, modelName: "RolePermission", tableName: "role_permissions", timestamps: true,
         indexes: [{ unique: true, fields: ["role", "permissionId"] }] });
    return RolePermission;
  }
}

module.exports = RolePermission;
