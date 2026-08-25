const { DataTypes, Model } = require("sequelize");

class Booking extends Model {
  static initModel(sequelize) {
    Booking.init({
      bookingNo: { type: DataTypes.STRING(40), unique: true },
      customerId: { type: DataTypes.INTEGER, allowNull: false },
      driverId: { type: DataTypes.INTEGER, allowNull: true },
      vehicleId: { type: DataTypes.INTEGER, allowNull: true },
      pickupLocation: { type: DataTypes.STRING(255), allowNull: false },
      dropLocation: { type: DataTypes.STRING(255), allowNull: false },
      pickupDate: { type: DataTypes.DATEONLY, allowNull: false },
      pickupTime: { type: DataTypes.TIME, allowNull: false },
      bookingType: { type: DataTypes.ENUM("ONE_WAY", "ROUND_TRIP", "HOURLY"), defaultValue: "ONE_WAY" },
      vehicleType: DataTypes.STRING(50),
      fare: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
      remarks: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM("PENDING", "CONFIRMED", "ASSIGNED", "ACCEPTED", "STARTED", "COMPLETED", "CANCELLED"),
        defaultValue: "PENDING"
      }
    }, { sequelize, modelName: "Booking", tableName: "bookings", timestamps: true });
    return Booking;
  }
}

module.exports = Booking;
