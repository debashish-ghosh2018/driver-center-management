const { DataTypes, Model } = require("sequelize");

class Customer extends Model {
  static initModel(sequelize) {
    Customer.init({
      customerCode: { type: DataTypes.STRING(30), unique: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      mobile: { type: DataTypes.STRING(20), allowNull: false },
      email: { type: DataTypes.STRING(160), validate: { isEmail: true } },
      address: DataTypes.TEXT,
      city: DataTypes.STRING(80),
      state: DataTypes.STRING(80),
      pincode: DataTypes.STRING(10),
      status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), defaultValue: "ACTIVE" }
    }, { sequelize, modelName: "Customer", tableName: "customers", timestamps: true });
    return Customer;
  }
}

module.exports = Customer;
