const { DataTypes, Model } = require("sequelize");

class Payment extends Model {
  static initModel(sequelize) {
    Payment.init({
      bookingId: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
      paymentMode: { type: DataTypes.ENUM("CASH", "UPI", "CARD", "BANK_TRANSFER"), allowNull: false },
      transactionId: DataTypes.STRING(120),
      paymentStatus: { type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "REFUNDED"), defaultValue: "PAID" },
      paymentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { sequelize, modelName: "Payment", tableName: "payments", timestamps: true });
    return Payment;
  }
}

module.exports = Payment;
