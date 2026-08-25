const { DataTypes, Model } = require("sequelize");

class Vehicle extends Model {
  static initModel(sequelize) {
    Vehicle.init({
      vehicleNo: { type: DataTypes.STRING(30), unique: true, allowNull: false },
      vehicleType: { type: DataTypes.STRING(50), allowNull: false },
      brand: DataTypes.STRING(80),
      model: DataTypes.STRING(80),
      year: DataTypes.INTEGER,
      insuranceExpiry: DataTypes.DATEONLY,
      fitnessExpiry: DataTypes.DATEONLY,
      status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE", "MAINTENANCE"), defaultValue: "ACTIVE" }
    }, { sequelize, modelName: "Vehicle", tableName: "vehicles", timestamps: true });
    return Vehicle;
  }
}

module.exports = Vehicle;
