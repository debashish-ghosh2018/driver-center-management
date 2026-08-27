const { DataTypes, Model } = require("sequelize");

class Permission extends Model {
  static initModel(sequelize) {
    Permission.init({
      code: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      module: { type: DataTypes.STRING(80), allowNull: false }
    }, { sequelize, modelName: "Permission", tableName: "permissions", timestamps: true });
    return Permission;
  }
}

module.exports = Permission;
