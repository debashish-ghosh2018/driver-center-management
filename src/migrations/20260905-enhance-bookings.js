"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "tripCategory", {type: Sequelize.ENUM("LOCAL","OUTSTATION"), allowNull: false, defaultValue: "LOCAL"});
    await queryInterface.addColumn("bookings", "returnDate", {type: Sequelize.DATEONLY, allowNull: true});
    await queryInterface.addColumn("bookings", "returnTime", {type: Sequelize.TIME, allowNull: true});
    await queryInterface.addColumn("bookings", "estimatedDistanceKm", {type: Sequelize.DECIMAL(10,2), allowNull: true});
    await queryInterface.addColumn("bookings", "estimatedDays", {type: Sequelize.INTEGER, allowNull: true});

    const monetaryFields = ["baseFare", "driverAllowance", "nightAllowance", "tollCharges", "parkingCharges", "stateTax", "otherCharges", "discountAmount"];
    for (const field of monetaryFields) {
      await queryInterface.addColumn("bookings", field, {type: Sequelize.DECIMAL(12,2), allowNull: false, defaultValue: 0});
    }

    await queryInterface.addColumn("bookings", "driverCommissionType", {type: Sequelize.ENUM("PERCENTAGE", "FIXED"), allowNull: false, defaultValue: "PERCENTAGE"});
    await queryInterface.addColumn("bookings", "driverCommissionRate", {type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0});
    await queryInterface.addColumn("bookings", "driverCommissionAmount", {type: Sequelize.DECIMAL(12,2), allowNull: false, defaultValue: 0});
    await queryInterface.addColumn("bookings", "driverNetEarning", {type: Sequelize.DECIMAL(12,2), allowNull: false, defaultValue: 0});
  },
  async down(queryInterface) {
    const fields = ["tripCategory", "returnDate", "returnTime", "estimatedDistanceKm", "estimatedDays", "baseFare", "driverAllowance", "nightAllowance", "tollCharges", "parkingCharges", "stateTax", "otherCharges", "discountAmount", "driverCommissionType", "driverCommissionRate", "driverCommissionAmount", "driverNetEarning"];
    for (const field of fields) {
      await queryInterface.removeColumn("bookings", field);
    }
  }
};